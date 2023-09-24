type ResourceCardProps = {
  id: string;
  imageUrl: string;
  count?: number;
};

function ResourceCard({ imageUrl, count }: ResourceCardProps) {
  return (
    <div className="relative p-1 flex items-center justify-center bg-neutral-100 rounded-lg">
      <img src={imageUrl} />
      {(count !== undefined) && (
        <div className="px-2 absolute right-0 bottom-0 bg-red-500 text-white text-sm rounded-full">
          <span>{count}</span>
        </div>
      )}
    </div>
  )
}

export default function ResourceCards({ cardProps }: { cardProps: ResourceCardProps[] }) {
  return (
    <div className="my-2 grid grid-cols-6 md:grid-cols-10 gap-1 md:gap-2">
      {cardProps.map((prop) => (
        <ResourceCard key={prop.id} {...prop} />
      ))}
    </div>
  );
}
