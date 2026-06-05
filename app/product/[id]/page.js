import ItemDetail from "../../WebsiteComponent/Homecomponents/ItemDetail";

export default function Page({ params }) {
  return <ItemDetail id={params.id} />;
}
