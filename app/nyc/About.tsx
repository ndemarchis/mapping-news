import Link from "@/components/shared/link";

const About = () => (
  <div className="items-left z-10 m-auto flex min-h-screen w-full flex-col justify-start gap-4 p-4 *:z-10 md:max-w-xl">
    <h2 className="mx-auto">about this map</h2>
    <p>
      this map was developed by{" "}
      <Link href="https://nickdemarchis.com">nick deMarchis</Link> over the
      course of a few weeks as a proof-of-concept to map places mentioned in
      local news articles in realtime in New York City.
    </p>
    <p>
      it seems like it&apos;s worked, at least to some degree. there&apos;s some
      dust and clear areas for improvement that i have documented, obviously.
      check the{" "}
      <Link href="https://github.com/ndemarchis/mapping-news/issues">
        issue tracker
      </Link>{" "}
      to see what&apos;s up. or, you can contact me with the information
      mentioned at the bottom of{" "}
      <Link href="/about" sameWindow>
        the about page
      </Link>
      .
    </p>
    <h3>process</h3>
    <p>
      there are three main parts of this project: a recurring Python script, a
      database, and the frontend.
    </p>
    <p>
      the Python script is supposed to run on a schedule. it checks against a
      predetermined set of RSS feeds, and determines whether any new articles
      have been added since it last checked. if so, it will pull relevant
      information from those articles, and temporarily store them.
    </p>
    <p>
      it then uses OpenAI&apos;s{" "}
      <Link href="https://openrouter.ai/openai/gpt-4o-mini-2024-07-18">
        <span className="font-mono">gpt-4o-mini-2024-07-18</span>
      </Link>{" "}
      model to extract physical locations that are mentioned in the text of each
      article.
    </p>
    <p>
      after we have relevant locations extracted, we use the Google Maps
      Geocoding API to determine their location, as well as to provide metadata
      on whether the place is too generic to be mapped at this proof-of-concept
      stage (for instance, counties, states). we can then use the{" "}
      <span className="font-mono">place_id</span> that they provide to associate
      articles with each other.
    </p>
    <p>
      we then send information on our locations, our articles and each relation
      between an article and location to our database.
    </p>
    <p>
      on the frontend, whenever someone loads the page, we use a{" "}
      <Link href="https://nextjs.org/docs/app/building-your-application/routing/route-handlers">
        Next.js Route Handler
      </Link>{" "}
      to reformat our database information as GeoJSON as requested. we then
      serve that GeoJSON to an OpenLayers map.
    </p>
    <p>
      when a user clicks a location, we then use another route to handle
      database requests, and pull the information of the articles that match the
      selected location.
    </p>
    <h3>blind spots</h3>
    <p>
      there are quite a few blind spots and limitations associated here. to name
      a few:
    </p>
    <ul className="list-disc pl-4">
      <li>
        the OpenAI model isn&apos;t amazing at pulling out non-obvious
        locations, and sometimes is either too verbose or too general
      </li>
      <li>
        at this moment, i can only really use publications that have working RSS
        feeds. this is mostly fine, as most still do, but not all.
      </li>
      <li>
        i did my best to filter feeds by their metro/local reporting, if
        relevant. that obviously could leave a lot of state- or federal-level
        news with local impact off the map.
      </li>
    </ul>
    <h3>next steps</h3>
    <p>
      like i said,{" "}
      <Link href="https://github.com/ndemarchis/mapping-news/issues">
        issue tracker
      </Link>
      . there&apos;s a <span className="italic">lot</span> of work to do —{" "}
      <span className="italic">especially</span> to expand this work to more
      communities and understand better how neighborhoods receive news coverage.
    </p>
  </div>
);

export default About;
