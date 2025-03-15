import "../styles/page-loader.css";
export default function Loading() {
  return (
    <div className="min-h-[80dvh] flex justify-center items-center">
      <div className={"loader border dark:border-white"} />
    </div>
  );
}
