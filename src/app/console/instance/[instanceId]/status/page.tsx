import ClientInstanceStatus from "./ClientInstanceStatus";

export default async function InstanceStatusPage({
  params,
}: {
  params: Promise<{ instanceId: string }>;
}) {
  const { instanceId } = await params;

  return <>
    <div className="container place-content-center  p-4 sm:p-6 lg:p-8">
      <ClientInstanceStatus instanceId={instanceId} />
    </div>
  </>;
}
