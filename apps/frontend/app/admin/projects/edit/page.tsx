import { Suspense } from "react";
import ProjectFormClient from "@/components/admin/project/project-form-client";

export default function EditProjectPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProjectFormClient />
        </Suspense>
    );
}
