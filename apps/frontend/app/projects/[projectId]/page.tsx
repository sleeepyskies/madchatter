import ProjectForm from "@/components/project/project-form";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ projectId: number }>;
}) {
  const { projectId } = await params;

  return <ProjectForm projectId={Number(projectId)} />;
}
