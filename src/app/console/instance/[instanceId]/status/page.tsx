import ClientInstanceStatus from "./ClientInstanceStatus";

export default async function InstanceStatusPage({
  params,
}: {
  params: Promise<{ instanceId: string }>;
}) {
  const { instanceId } = await params;

  return <ClientInstanceStatus instanceId={instanceId} />;
}
