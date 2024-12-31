import Link from "@/components/shared/link";

export default function Footer() {
  return (
    <div className="absolute w-full py-5 text-center">
      <p className="text-gray-500">
        a project by{" "}
        <Link href="https://nickdemarchis.com">nick deMarchis</Link>
         · <Link href="https://github.com/ndemarchis/mapping-news">github</Link>
         · 
        <Link href="/about" sameWindow>
          about this site
        </Link>
      </p>
    </div>
  );
}
