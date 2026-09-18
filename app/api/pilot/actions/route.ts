import { z } from "zod";
import {
  requirePilotSession,
  PilotError,
  checkDatabaseError,
} from "@/app/lib/pilot/auth";
import { createServiceClient } from "@/app/lib/pilot/supabase";
import { draftSchema, employeeSchema, uuid } from "@/app/lib/pilot/validation";
import {
  errorResponse,
  jsonResponse,
  requireSameOrigin,
} from "@/app/lib/pilot/http";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const body = await request.json();
    const action = z.string().parse(body.action);
    const management = ["assign"].includes(action);
    const learning = ["advance", "quiz"].includes(action);
    const { client, employee: actor } = await requirePilotSession(
      learning ? undefined : management ? ["ADMIN", "MANAGER"] : ["ADMIN"],
    );
    if (action === "employee-create" || action === "employee-update") {
      const input = employeeSchema.parse(body.employee);
      const service = createServiceClient();
      let target: string;
      if (action === "employee-create") {
        const password = z.string().min(12).max(128).parse(body.password);
        // Supabase owns password hashing. The temporary password is never stored
        // in application tables or logs. Management shares it out of band.
        const { data, error } = await service.auth.admin.createUser({
          email: input.email,
          password,
          email_confirm: true,
        });
        if (error || !data.user)
          throw new PilotError(
            "Account could not be created. Check the email address or existing employee records.",
          );
        target = data.user.id;
      } else {
        target = uuid.parse(body.id);
        if (
          target === actor.id &&
          (!input.active || input.app_role !== "ADMIN")
        )
          throw new PilotError(
            "You cannot remove your own administrator access.",
          );
        const existing = await client
          .from("employees")
          .select("email")
          .eq("id", target)
          .single();
        checkDatabaseError(existing.error);
        if (existing.data?.email !== input.email) {
          const { error } = await service.auth.admin.updateUserById(target, {
            email: input.email,
            email_confirm: true,
          });
          if (error) throw new PilotError("Email could not be updated.");
        }
      }
      const { email: _email, ...fields } = input;
      void _email;
      const { error } = await client.rpc("update_employee", {
        target,
        ...fields,
      });
      if (error && action === "employee-create") {
        // The identity remains inactive if provisioning fails. Keep it visible to
        // management for repair instead of attempting a destructive compensation.
        throw new PilotError(
          "The account was created inactive. Open Employees to finish its setup.",
        );
      }
      checkDatabaseError(error);
      return jsonResponse({ id: target });
    }
    if (action === "item-create") {
      const { data, error } = await client.rpc("create_item", {
        item_kind: z.enum(["TRAINING", "SOP"]).parse(body.kind),
        item_title: z.string().trim().min(1).max(160).parse(body.title),
      });
      checkDatabaseError(error);
      return jsonResponse({ id: data });
    }
    if (action === "item-save") {
      const draft = draftSchema.parse(body.draft);
      const { error } = await client.rpc("save_item", { draft });
      checkDatabaseError(error);
      return jsonResponse({ message: "Draft saved." });
    }
    if (action === "item-status") {
      const { error } = await client.rpc("set_item_status", {
        target: uuid.parse(body.id),
        next_status: z
          .enum(["DRAFT", "PUBLISHED", "ARCHIVED"])
          .parse(body.status),
      });
      checkDatabaseError(error);
      return jsonResponse({ message: "Status updated." });
    }
    if (action === "assign") {
      const { data, error } = await client.rpc("assign_training", {
        employee: uuid.parse(body.employee_id),
        module: uuid.parse(body.module_id),
      });
      checkDatabaseError(error);
      return jsonResponse({ id: data, message: "Training assigned." });
    }
    if (action === "advance") {
      const { error } = await client.rpc("advance_training", {
        target: uuid.parse(body.id),
        acknowledge_content: z.boolean().parse(body.acknowledge),
      });
      checkDatabaseError(error);
      return jsonResponse({
        message: body.acknowledge ? "Content completed." : "Training started.",
      });
    }
    if (action === "quiz") {
      const answers = z
        .record(uuid, z.number().int().min(0).max(5))
        .parse(body.answers);
      const { data, error } = await client.rpc("submit_quiz", {
        target: uuid.parse(body.id),
        answers,
      });
      checkDatabaseError(error);
      return jsonResponse(data);
    }
    throw new PilotError("Unknown action.");
  } catch (error) {
    return errorResponse(error);
  }
}
