type ResourceCardProps = {
  id: string;
  imageUrl: string;
  count?: number;
};

function ResourceCard({ imageUrl, count }: ResourceCardProps) {
  return (
    <div className="relative p-1 flex items-center justify-center bg-neutral-100 rounded-lg">
      <img src={imageUrl} alt="자원 정보" />
      {(count !== undefined) && (
        <div className="px-2 absolute right-0 bottom-0 bg-red-500 text-white text-sm rounded-full">
          <span>{count}</span>
        </div>
      )}
    </div>
  )
}

type ResourceCardsProps = {
  cardProps: ResourceCardProps[];
  mobileGrid?: 5 | 6;
};

export default function ResourceCards({ mobileGrid, cardProps }: ResourceCardsProps) {
  const mobileGridClass = mobileGrid === 5 ? "grid-cols-5" : "grid-cols-6";
  return (
    <div className={`my-2 grid ${mobileGridClass} md:grid-cols-10 gap-1 md:gap-2`}>
      {cardProps.map((prop) => (
        <ResourceCard key={prop.id} {...prop} />
      ))}
    </div>
  );
}
