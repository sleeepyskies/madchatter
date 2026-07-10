import { Suspense } from "react";
import KnowledgeFormClient from "@/components/admin/knowledge/knowledge-form-client";

export default function EditKnowledgePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <KnowledgeFormClient />
        </Suspense>
    );
}
