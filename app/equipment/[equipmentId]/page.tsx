import Link from "next/link";
import { EquipmentDetail } from "../../components/operations/EquipmentDetail";
import { brand } from "../../config/brand";
export default async function Page({params}:{params:Promise<{equipmentId:string}>}){const {equipmentId}=await params;return <main className="qr-route"><header><Link href="/" className="wordmark">{brand.name}.</Link><span className="tag">Equipment access</span></header><EquipmentDetail equipmentId={equipmentId} mobile/></main>}
