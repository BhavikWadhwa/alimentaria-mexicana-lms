import { LessonPage } from "../../../components/training/LessonPage";
export default async function Page({params}:{params:Promise<{moduleId:string}>}){const {moduleId}=await params;return <LessonPage moduleId={moduleId}/>}
