import { EquipmentDetail } from "../../../components/operations/EquipmentDetail";
export default async function Page({params}:{params:Promise<{equipmentId:string}>}){const {equipmentId}=await params;return <EquipmentDetail equipmentId={equipmentId}/>}
