// Schema.org JSON-LD for the portfolio. Every value comes from profile.js and
// matches what the page shows; nothing here should exist only for search
// engines. Entities share @ids so the Person and WebSite are defined once.
import { person, projects, education, certifications, skills, publication } from '../data/profile.js';
import { homeSeo, projectSeo } from '../data/seo.js';

const ids = (site) => ({
  person: `${site}#person`,
  website: `${site}#website`,
});

/** The Person and WebSite nodes, included on every page. */
function core(site) {
  const id = ids(site);
  return [
    {
      '@type': 'Person',
      '@id': id.person,
      name: person.name,
      alternateName: ['Abhiram R S', 'Abhiram R. S.'],
      url: site,
      email: `mailto:${person.email}`,
      jobTitle: person.role,
      worksFor: { '@type': 'Organization', name: person.employer },
      address: { '@type': 'PostalAddress', addressLocality: 'Trivandrum', addressRegion: 'Kerala', addressCountry: 'IN' },
      alumniOf: { '@type': 'CollegeOrUniversity', name: education.school },
      knowsLanguage: person.languages,
      // Short skill names only; longer descriptive entries read badly as topics.
      knowsAbout: skills.flatMap((s) => s.items).map((s) => s.replace(/ \(.*\)$/, '')).filter((s) => s.length <= 40),
      hasCredential: certifications.map((c) => ({
        '@type': 'EducationalOccupationalCredential',
        name: c.name,
        credentialCategory: 'certification',
        recognizedBy: { '@type': 'Organization', name: c.issuer },
        url: c.href,
      })),
      sameAs: [person.github, person.linkedin],
    },
    {
      '@type': 'WebSite',
      '@id': id.website,
      url: site,
      name: person.name,
      description: homeSeo.description,
      inLanguage: 'en',
      publisher: { '@id': id.person },
    },
  ];
}

const graph = (nodes) => ({ '@context': 'https://schema.org', '@graph': nodes });

export function homeSchema(site) {
  const id = ids(site);
  return graph([
    ...core(site),
    {
      '@type': 'ProfilePage',
      '@id': `${site}#webpage`,
      url: site,
      name: homeSeo.title,
      description: homeSeo.description,
      inLanguage: 'en',
      isPartOf: { '@id': id.website },
      mainEntity: { '@id': id.person },
      hasPart: projects.map((p) => ({ '@id': `${site}work/${p.slug}/#project` })),
    },
  ]);
}

export function projectSchema(site, p) {
  const id = ids(site);
  const pageUrl = `${site}work/${p.slug}/`;
  const seo = projectSeo[p.slug];
  const repo = p.links.find((l) => l.href.startsWith('https://github.com/'))?.href;
  const live = p.links.find((l) => /^https?:/.test(l.href) && !l.href.endsWith('.pdf') && l.href !== repo)?.href;

  const project = {
    '@type': repo ? 'SoftwareSourceCode' : 'CreativeWork',
    '@id': `${pageUrl}#project`,
    name: p.fullName ?? p.name,
    ...(p.fullName ? { alternateName: p.name } : {}),
    description: seo.description,
    url: pageUrl,
    creator: { '@id': id.person },
    keywords: p.stack.join(', '),
    ...(repo ? { codeRepository: repo, programmingLanguage: p.stack.filter((s) => ['TypeScript', 'Python'].includes(s)) } : {}),
    ...(live ? { sameAs: live } : {}),
  };
  if (p.slug === 'lora-alerting') {
    project.subjectOf = {
      '@type': 'ScholarlyArticle',
      headline: publication.title,
      url: publication.href,
      isPartOf: { '@type': 'Periodical', name: publication.venue },
    };
  }

  return graph([
    ...core(site),
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: seo.title,
      description: seo.description,
      inLanguage: 'en',
      isPartOf: { '@id': id.website },
      about: { '@id': `${pageUrl}#project` },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: person.name, item: site },
          { '@type': 'ListItem', position: 2, name: p.name, item: pageUrl },
        ],
      },
    },
    project,
  ]);
}
