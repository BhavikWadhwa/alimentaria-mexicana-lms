"use client";

import { useEffect, useState } from "react";
import { initialOperationsState } from "../data/operations-data";
import type { OperationsState } from "../types";
import { readStorage, STORAGE_KEYS, writeStorage } from "./storage";

const EVENT_NAME="baysics-operations";

export function useOperations(){
  const [state,setState]=useState<OperationsState>(initialOperationsState);
  useEffect(()=>{
    const sync=()=>setState(readStorage(STORAGE_KEYS.operations,initialOperationsState));
    queueMicrotask(sync);
    window.addEventListener(EVENT_NAME,sync);
    return()=>window.removeEventListener(EVENT_NAME,sync);
  },[]);
  const update=(updater:(current:OperationsState)=>OperationsState)=>setState(current=>{const next=updater(current);writeStorage(STORAGE_KEYS.operations,next);window.dispatchEvent(new Event(EVENT_NAME));return next});
  return {state,update};
}
