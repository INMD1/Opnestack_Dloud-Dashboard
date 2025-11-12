import ClientInstanceStatus from "./ClientInstanceStatus";

export default async function InstanceStatusPage({
  params,
}: {
  params: { instanceId: string };
}) {
  const { instanceId } = params;

  return <ClientInstanceStatus instanceId={instanceId} />;
}