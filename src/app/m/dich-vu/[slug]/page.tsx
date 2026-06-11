import ServiceSPA from '../ServiceSPA';

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ServiceSPA initialSlug={slug} />;
}
