import Link from "@/components/shared/link";
import { ArrowRight } from "lucide-react";

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
    <Link
      className="group grid grid-cols-[1fr_auto] items-center gap-3 text-balance rounded-lg border-2 border-gray-500 p-4 text-gray-500 transition-all hover:border-gray-800 hover:text-gray-800 md:gap-8"
      href="/presentations/ompsi-2025.pdf"
    >
      if you&apos;re into presentations, you can check out the one i gave in
      August 2025 at the <u>Oxford Media Policy Summer Institute</u>
      <ArrowRight
        className="inline transition-all group-hover:translate-x-[0.125rem]"
        size="16px"
      />
    </Link>
    <p>
      Local journalism is in crisis.{" "}
      <Link href="https://www.pewresearch.org/journalism/fact-sheet/local-newspapers/">
        Subscription revenue is in freefall
      </Link>{" "}
      and outlets can barely cover basic community issues with the resources
      they have. According to Pew, “at a time when{" "}
      <Link href="https://www.pewresearch.org/short-reads/2023/11/28/audiences-are-declining-for-traditional-news-media-in-the-us-with-some-exceptions/">
        many local news outlets are struggling
      </Link>{" "}
      and{" "}
      <Link href="https://www.pewresearch.org/short-reads/2022/10/27/u-s-adults-under-30-now-trust-information-from-social-media-almost-as-much-as-from-national-news-outlets/">
        Americans’ trust in the news media
      </Link>{" "}
      has waned, the vast majority of U.S. adults (85%) say local news outlets
      are at least somewhat important to the well-being of their local
      community.”
    </p>
    <p>
      This crisis has{" "}
      <Link href="https://www.usnewsdeserts.com/reports/expanding-news-desert/loss-of-local-news/">
        several downstream effects
      </Link>
      , including “
      <Link href="https://www.usnewsdeserts.com/reports/expanding-news-desert/">
        news deserts
      </Link>
      ” — areas of the country that receive <em>no</em> coverage because all of
      their outlets have closed. Northwestern University’s Medill School “
      <Link href="https://localnewsinitiative.northwestern.edu/">
        Local News Initiative
      </Link>
      ” tracks local outlets, and{" "}
      <Link href="https://localnewsinitiative.northwestern.edu/projects/state-of-local-news/2024/report/">
        releases an annual report
      </Link>{" "}
      analyzing local news coverage county-by-county across the US.{" "}
      <Link href="https://localnewsinitiative.northwestern.edu/projects/state-of-local-news/explore/#/localnewslandscape">
        It states that
      </Link>{" "}
      “There are 206 counties in the United States with no news outlets,”
      according to the initiative, and 1,558 counties only have one.{" "}
    </p>
    <p>
      This data has been invaluable to understanding the state of local news
      coverage and the consequences of news deserts are well-documented.
      However, I wanted to look beyond the physical spread of local outlets, and
      bring attention not just to the counties that have just one or two.{" "}
    </p>
    <p>
      My theory is that not all communities are treated equally when coverage is
      low and resources are spread thin. Could a county-level newspaper, for
      instance, focus a significant amount of coverage on the county seat, but
      miss happenings in other population centers spread miles away? If so, how
      could we know?
    </p>
    <p>
      This project aims to examine this problem by mapping the locations
      mentioned in local news articles in one region — New York City. Why? It’s
      where I live right now, but more importantly, it&#39;s one of the most{" "}
      <Link href="https://en.wikipedia.org/wiki/List_of_New_York_City_newspapers_and_magazines">
        journalism-heavy environments
      </Link>{" "}
      in the US. Moreover, many of the edge cases that would exist expanding
      this data to cover the rest of the country can be identified and addressed
      here. For instance, New Yorkers have their choice of corporate media (both
      print and TV), <Link href="https://www.thecity.nyc/">nonprofit</Link> and{" "}
      <Link href="https://hellgatenyc.com/">worker-owned</Link> outlets,
      non-English print-only publications and hyper-local, small-circulation
      dailies. We have duplicate addresses within coverage areas (Fifth Avenue
      in Brooklyn versus Manhattan), ambiguous locations like universities and
      hospitals, local names and landmarks, outlets with overlapping coverage
      areas, and more. That’s to say, the work is clear to expand this project
      more broadly.{" "}
    </p>
    <p>
      Others have undertaken similar projects— read more about them below. I
      will soon be creating a blog page and post updates to this project there,
      as well as on my personal{" "}
      <Link href="https://x.com/nickdemarchis">X</Link> and{" "}
      <Link href="https://bsky.app/profile/did:plc:kiu4tkgaytpy5ycu2tnwjz5m">
        Bluesky
      </Link>
      . And please feel free to{" "}
      <Link href="/about" sameWindow>
        reach out
      </Link>{" "}
      with any suggestions or comments!
    </p>
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
      . Read more{" "}
      <Link href="#why" sameWindow>
        above
      </Link>{" "}
      to understand why we&apos;re building this.
    </p>
    <h2 id="further-reading">further reading</h2>
    <ul className="list-disc pl-4 [&>li]:pb-2">
      <li>
        A. Khanom, D. Kiesow, M. Zdun, and C.-R. Shyu, “The News Crawler: A Big
        Data Approach to Local Information Ecosystems,”{" "}
        <span className="italic">MaC</span>, vol. 11, no. 3, Aug. 2023, doi:{" "}
        <Link href="https://doi.org/10.17645/mac.v11i3.6789">
          10.17645/mac.v11i3.6789
        </Link>
        .
      </li>
      <li>
        D. S. Shah, S. He, G. K. Siddiqi, and R. Bansal, “What’s happening in
        your neighborhood? A Weakly Supervised Approach to Detect Local News,”
        Jun. 05, 2024, arXiv: arXiv:2301.08146. doi:{" "}
        <Link href="https://doi.org/10.48550/arXiv.2301.08146">
          10.48550/arXiv.2301.08146
        </Link>
        .
      </li>
      <li>
        G. Ariyarathne and A. C. Nwala, “3DLNews: A Three-decade Dataset of US
        Local News Articles,” in{" "}
        <span className="italic">
          Proceedings of the 33rd ACM International Conference on Information
          and Knowledge Management
        </span>
        , Boise ID USA: ACM, Oct. 2024, pp. 5328–5332. doi:{" "}
        <Link href="https://doi.org/10.1145/3627673.3679165">
          10.1145/3627673.3679165
        </Link>
        .
      </li>
      <li>
        M. A. Le Quéré, S. Wang, T. Fatima, and M. Krisch, “Towards Identifying
        Local Content Deserts with Open-Source Large Language Models,” in{" "}
        <span className="italic">
          Proceedings of the Computation + Journalism Symposium 2024
        </span>
        , Boston, MA, Oct. 2024. Available:{" "}
        <Link href="https://cplusj2024.github.io/papers/CJ_2024_paper_25.pdf">
          cplusj2024.github.io
        </Link>
      </li>
      <li>
        S. Stonbely, “What Makes for Robust Local News Provision? Structural
        Correlates of Local News Coverage for an Entire U.S. State, and Mapping
        Local News Using a New Method,”{" "}
        <span className="italic">Journalism and Media</span>, vol. 4, no. 2, pp.
        485–505, Apr. 2023, doi:{" "}
        <Link href="https://doi.org/10.3390/journalmedia4020031">
          10.3390/journalmedia4020031
        </Link>
        .
      </li>
      <li>
        T. Neff, P. Popiel, and V. Pickard, “Philadelphia’s news media system:
        which audiences are underserved?,”{" "}
        <span className="italic">Journal of Communication</span>, vol. 72, no.
        4, pp. 476–487, Aug. 2022, doi:{" "}
        <Link href="https://doi.org/10.1093/joc/jqac018">
          10.1093/joc/jqac018
        </Link>
        .
      </li>
      <li>
        Z. Metzger, “The State of Local News,” Local News Initiative. Accessed:
        Jun. 09, 2025. [Online]. Available:{" "}
        <Link href="https://localnewsinitiative.northwestern.edu/projects/state-of-local-news/2024/report/">
          localnewsinitiative.northwestern.edu
        </Link>
      </li>
    </ul>
  </div>
);

export default About;
