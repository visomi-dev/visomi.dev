CREATE TABLE site_visit_days (
  site varchar(40) NOT NULL,
  day date NOT NULL,
  page varchar(40) NOT NULL,
  locale varchar(2) NOT NULL,
  views bigint NOT NULL,
  PRIMARY KEY (site, day, page, locale)
);
