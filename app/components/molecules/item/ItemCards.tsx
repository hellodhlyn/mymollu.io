import { type ItemCardProps, ItemCard } from "~/components/atoms/item";

type ItemCardsProps = {
  itemProps: ItemCardProps[];
};

export default function ItemCards({ itemProps }: ItemCardsProps) {
  return (
    <div className="flex">
      {itemProps.map((prop) => (
        <div key={`item-${prop.name}-${prop.labelClassName}`}>
          <ItemCard {...prop} />
        </div>
      ))}
    </div>
  )
}
