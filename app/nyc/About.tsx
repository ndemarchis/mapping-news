import Link from "@/components/shared/link";

const About = () => (
  <div className="items-left z-10 m-auto flex min-h-screen w-full flex-col justify-start gap-4 p-4 *:z-10 md:max-w-xl">
    <h2 id="about-this-map">about this map</h2>
    <p>
      <Link href="https://nickdemarchis.com/">Nick DeMarchis</Link> developed
      this page as a proof-of-concept to map New York locations mentioned in
      local news articles in near-realtime.{" "}
    </p>
    <p>
      While the map functions as intended, there are clear areas of improvement.
      Check the{" "}
      <Link href="https://github.com/ndemarchis/mapping-news/issues">
        issue tracker
      </Link>{" "}
      for a list of outstanding bugs. If you’ve found a new bug, or have feature
      requests, can contact me using the information found at the bottom of{" "}
      <Link href="http://localhost:3000/about">the about page</Link>.
    </p>
    <h2 id="why">why</h2>
    <h2 id="technical-details">technical details</h2>
    <h3 id="overview">overview</h3>
    <ul className="list-disc pl-4">
      <li>
        <strong>frontend</strong> —{" "}
        <Link href="/about" sameWindow>
          Next.js
        </Link>{" "}
        using <Link href="https://nextjs.org/docs/app">App router</Link>.{" "}
        <Link href="https://maplibre.org/maplibre-gl-js/docs">MapLibre GL</Link>{" "}
        map. GeoJSON served with{" "}
        <Link href="https://nextjs.org/docs/pages/building-your-application/routing/api-routes">
          Next API route
        </Link>
        .
      </li>
      <li>
        <strong>data collection</strong> — Python script with{" "}
        <Link href="https://github.com/codelucas/newspaper">
          <code>newspaper3k</code>
        </Link>{" "}
        library.
      </li>
      <li>
        <strong>database</strong> —{" "}
        <Link href="https://supabase.com/">Supabase</Link> SQL db with three
        tables to store articles, locations, and their relations.
      </li>
    </ul>
    <h3 id="details">details</h3>
    <p>
      The Python script runs on a schedule in a{" "}
      <Link href="https://github.com/features/actions">Github Action</Link>. It
      checks against a{" "}
      <Link href="https://github.com/ndemarchis/mapping-news/blob/main/public/feeds/feeds.csv">
        predetermined set of RSS feeds
      </Link>
      , and determines whether any new articles have been added since it was
      last checked. If so it will pull relevant information from those articles
      and temporarily store them. The script runs more frequently during the
      middle of the day and less frequently overnight.
    </p>
    <p>
      It then uses OpenAI’s{" "}
      <Link href="https://openrouter.ai/openai/gpt-4o-mini-2024-07-18">
        gpt-4o-mini-2024-07-18
      </Link>{" "}
      model with the following prompt to extract the physical locations
      mentioned in the text of each article.
    </p>
    <blockquote className="px-4">
      <p>
        <code>
          Your goal is to extract all points of interest and street addresses
          from the text provided.
        </code>
      </p>
    </blockquote>
    <p>
      After we have relevant locations extracted, we use the{" "}
      <Link href="https://developers.google.com/maps/documentation/geocoding/overview">
        Google Maps Geocoding API
      </Link>{" "}
      to determine their location. Any locations that are too generic to be
      mapped at this proof-of-concept stage — for instance, general county or
      state mentions — are removed.{" "}
    </p>
    <p>
      Our database then receives information about the locations, the articles,
      and the relationship between the locations and articles.{" "}
    </p>
    <p>
      On the frontend, whenever someone loads the page we use a{" "}
      <Link href="https://nextjs.org/docs/app/building-your-application/routing/route-handlers">
        Next.js Route Handler
      </Link>{" "}
      to reformat our database information as GeoJSON. We then serve that
      GeoJSON to an MapLibre GL map.{" "}
    </p>
    <p>
      When a user clicks a location, we use another route to handle database
      requests and pull the information of the articles that match the selected
      location.{" "}
    </p>
    <h3 id="blind-spots">blind spots</h3>
    <p>There are issues, here are some:</p>
    <ul className="list-disc pl-4">
      <li>
        The OpenAI model isn’t amazing at pulling out non-obvious locations, and
        sometimes is either too verbose or too general.{" "}
      </li>
      <li>
        At this moment, we can only use publications that have working RSS
        feeds. Most still do, but not all.{" "}
      </li>
      <li>
        We did our best to filter feeds by their metro/local reporting, when
        relevant. That could leave state- or federal-level news stories that
        have local impact off the map.{" "}
      </li>
    </ul>
    <h3 id="next-steps">next steps</h3>
    <p>
      There’s a lot of work left to do in regards to addressing problems found
      in the{" "}
      <Link href="https://github.com/ndemarchis/mapping-news/issues">
        issue tracker
      </Link>
      . One of our biggest goals is to expand this work to more communities and
      better understand how neighborhoods receive news coverage.{" "}
    </p>
    <h2 id="further-reading">further reading</h2>
    <ul className="list-disc pl-4 [&>li]:pb-2">
      <li>
        Z. Metzger, “The State of Local News,” Local News Initiative. Accessed:
        Dec. 31, 2024. [Online]. Available:{" "}
        <Link href="https://localnewsinitiative.northwestern.edu/projects/state-of-local-news/2024/report/">
          localnewsinitiative.northwestern.edu
        </Link>
      </li>
      <li>
        G. Ariyarathne and A. C. Nwala, “3DLNews: A Three-decade Dataset of US
        Local News Articles,” in
        <span className="italic">
          Proceedings of the 33rd ACM International Conference on Information
          and Knowledge Management (CIKM ’24)
        </span>
        , New York, NY, USA: ACM, 2024, pp. 1–5. doi:{" "}
        <Link href="https://doi.org/10.1145/3627673.3679165">
          10.1145/3627673.3679165
        </Link>
        .
      </li>
      <li>
        <Link href="https://www.mediacloud.org/">Media Cloud</Link>
      </li>
    </ul>
  </div>
);

export default About;
