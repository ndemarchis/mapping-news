import NextLink from "next/link";
import React from "react";

// from portfolio-mdx

const Link = ({
  className = "link",
  href = "#",
  sameWindow = false,
  ...props
}: Parameters<typeof NextLink>[number] & { sameWindow?: boolean }) => {
  return (
    <NextLink
      {...props}
      className={className}
      href={href}
      target={!sameWindow ? "_blank" : undefined}
      rel={!sameWindow ? "noopener noreferrer" : undefined}
    >
      <>{props.children}</>
    </NextLink>
  );
};

export default Link;
