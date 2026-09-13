# Phase 1 Dataset Report

Generated 2026-09-13 for the Art Taste Profiler Phase 1 checkpoint.

## Outcome

The final local catalog contains exactly 36 unique, open-access works and 36 decodable local JPEG images. It is balanced evenly across three official museum sources and divided into 24 quiz, 6 recommendation, and 6 holdout records. All artwork IDs match saved embedding IDs. The eight fixed initial pairs use 16 distinct quiz works; recommendation and holdout works do not appear.

The final catalog was visually reviewed as a contact sheet. No broken, tiny, exact-duplicate, or obviously redundant image remained. The set covers paintings, sculpture, photography, prints, textiles, ceramics, decorative arts and design objects; figurative and nonrepresentational images; restrained and saturated palettes; and several geographic and cultural contexts.

## Candidate and source counts

| Source | Candidates reviewed | Rejected | Final |
| --- | ---: | ---: | ---: |
| Art Institute of Chicago | 13 | 1 | 12 |
| Cleveland Museum of Art | 12 | 0 | 12 |
| The Metropolitan Museum of Art | 13 | 1 | 12 |
| **Total** | **38** | **2** | **36** |

Two candidates were rejected because their image-rights status did not satisfy the local open-access-image requirement. They were replaced before embedding generation. Official collection APIs and object pages were used only during preparation; the deployed site makes no museum or model request.

## Role, medium, and period balance

Roles: quiz 24; recommendation 6; holdout 6.

Normalized broad medium summary:

| Medium group | Count |
| --- | ---: |
| Painting | 14 |
| Sculpture | 8 |
| Decorative object / design | 9 |
| Print / work on paper | 2 |
| Textile | 2 |
| Photography | 1 |

Period bands use the normalized start year:

| Period band | Count |
| --- | ---: |
| Before 1400 | 10 |
| 1400–1799 | 8 |
| 1800–1944 | 18 |
| 1945–present | 0 |

The normalized culture/region field contains France (8), Japan (4), Netherlands (3), United States (3), Germany (2), Peru (Moche) (2), and one each for England, Ghana (Asante), Italy (Nola), Korea (Joseon), Peru (Chimú), Peru (Nasca), and Roman. Seven records have no source-supplied culture/region value. Period qualifiers and source-specific word order are removed from this display field so equivalent regions aggregate consistently.

Every record also has one concise movement/style label. The controlled vocabulary uses a named movement or school when one responsibly applies, and an established period style or cultural tradition for ancient and decorative objects rather than forcing those works into modern Western movements. Ukiyo-e appears 3 times; Dutch Golden Age, Moche, and Post-Impressionism appear twice each; the remaining 27 labels appear once each. Labels were checked against the official Art Institute of Chicago, Cleveland Museum of Art, and Metropolitan Museum of Art records, supplemented by established art-historical terminology where an institution supplied period, culture, or artist context rather than a dedicated style field.

## Images and metadata

- Local images: 36/36 decoded successfully.
- Width range: 416–1263 px.
- Height range: 231–2044 px.
- File-size range: 36,614–828,447 bytes.
- Total local image size: 10,552,310 bytes (about 10.1 MiB).
- Missing title, date, medium, alt text, source URL, or rights statement: 0.
- Missing artist/maker: 11; these are anonymous, source-unattributed, or identified only by a broad geographic attribution and are shown as “Creator not recorded.”
- Missing culture/region: 7; no value was invented.
- Missing movement/style: 0; each label identifies a documented movement, school, period style, or cultural tradition.

Display labels use a consistent compact format: named creators omit nationality and lifespan biographies, approximate dates use `c.`, eras use `BCE` and `CE`, numeric ranges use en dashes, and culture-qualified regions use `Place (Culture)`.

Stable artwork IDs, `source + sourceId`, local paths, embedding keys, and exact image hashes are unique. Title-plus-artist review and visual contact-sheet review found no duplicate work. The validator confirms that all official source URLs are syntactically valid and all local images decode.

## Embeddings and concept signals

- Package: `@huggingface/transformers` 3.8.1
- Checkpoint: `Xenova/clip-vit-base-patch32`
- Pinned revision: `d15189d7028b43f1d3e65039190477f6af591c2a`
- ONNX dtype: q8
- Embedding dimension: 512
- Normalization tolerance: 0.00001 from unit L2 norm
- Prompt version: `core-concepts-v1`

All 36 vectors contain only finite numbers, have dimension 512, and pass the documented norm tolerance. All 36 records contain scores for the six paired groups: abstract/figurative, minimal/visually dense, geometric/organic, restrained/saturated color, calm/dramatic, and traditional/experimental. These CLIP-derived values are model signals for an educational experiment, not factual labels or psychological measurements.

## Source and attribution table

| ID | Work and official source | Artist / maker | Date | Institution | Rights / credit |
| --- | --- | --- | --- | --- | --- |
| aic-11143 | [The Fear of Love](https://www.artic.edu/artworks/11143) | Jean Louis Lemoyne | 1742 | Art Institute of Chicago | Public Domain. Richard T. Crane, Jr. Endowment |
| aic-116363 | [Field Armor for Man](https://www.artic.edu/artworks/116363) | Creator not recorded | c. 1520 | Art Institute of Chicago | Public Domain. George F. Harding Collection |
| aic-2102 | [The Elephant, from The Berain Grotesques Series](https://www.artic.edu/artworks/2102) | Jean Baptiste Monnoyer; Jean I Berain; Manufacture Royale de Beauvais | c. 1688–1732 | Art Institute of Chicago | Public Domain. Robert Allerton Endowment |
| aic-253 | [Hydria (Water Jar)](https://www.artic.edu/artworks/253) | Creator not recorded | c. 300 BCE | Art Institute of Chicago | Public Domain. Museum Purchase Fund |
| aic-27992 | [A Sunday on La Grande Jatte — 1884](https://www.artic.edu/artworks/27992) | Georges Seurat | 1884–1886, border added 1888–1889 | Art Institute of Chicago | Public Domain. Helen Birch Bartlett Memorial Collection |
| aic-29230 | [Julia Jackson](https://www.artic.edu/artworks/29230) | Julia Margaret Cameron | 1867 | Art Institute of Chicago | Public Domain. Harriott A. Fox Endowment |
| aic-5150 | [Summer: Planting Rice](https://www.artic.edu/artworks/5150) | Torii Kiyomasu II | c. 1730s | Art Institute of Chicago | Public Domain. Japanese Print Purchase Fund |
| aic-65821 | [Composition (No. 1) Gray-Red](https://www.artic.edu/artworks/65821) | Piet Mondrian | 1935 | Art Institute of Chicago | Public Domain. Gift of Mrs. Gilbert W. Chapman |
| aic-66042 | [Trompe-l'Oeil Still Life with a Flower Garland and a Curtain](https://www.artic.edu/artworks/66042) | Adriaen van der Spelt and Frans van Mieris | 1658 | Art Institute of Chicago | Public Domain. Wirt D. Walker Fund |
| aic-79431 | [Dramatic and Grandiose with Her Face like that of a Druid Priestess](https://www.artic.edu/artworks/79431) | Odilon Redon | 1887 | Art Institute of Chicago | Public Domain. The Stickney Collection |
| aic-81535 | [Sea View, Calm Weather](https://www.artic.edu/artworks/81535) | Édouard Manet | 1864 | Art Institute of Chicago | Public Domain. Potter Palmer Collection |
| aic-8991 | [Improvisation No. 30 (Cannons)](https://www.artic.edu/artworks/8991) | Vasily Kandinsky | 1913 | Art Institute of Chicago | Public Domain. Arthur Jerome Eddy Memorial Collection |
| cma-106088 | [Early Morning After a Storm at Sea](https://www.clevelandart.org/art/1924.195) | Winslow Homer | 1900–1903 | Cleveland Museum of Art | CC0. Gift of J. H. Wade |
| cma-111654 | [South Wind, Clear Sky](https://www.clevelandart.org/art/1930.189) | Katsushika Hokusai | early 1830s | Cleveland Museum of Art | CC0. Bequest of Edward L. Whittemore |
| cma-124089 | [Portrait of a Woman](https://www.clevelandart.org/art/1944.90) | Rembrandt van Rijn; Studio | 1635 or earlier | Cleveland Museum of Art | CC0. The Elisabeth Severance Prentiss Collection |
| cma-124800 | [Vessel with Abstract Heads](https://www.clevelandart.org/art/1946.279) | Creator not recorded | 100 BCE–700 CE | Cleveland Museum of Art | CC0. James Albert Ford Memorial Fund |
| cma-144631 | [Gold Weight (abrammuo): Geometric](https://www.clevelandart.org/art/1969.265) | Creator not recorded | 1800s | Cleveland Museum of Art | CC0. Gift of Georges D. Rodrigues |
| cma-152349 | [Untitled](https://www.clevelandart.org/art/1985.203) | Robert Demachy | c. 1900–1906 | Cleveland Museum of Art | CC0. Gift of Mr. and Mrs. Thomas A. Mann |
| cma-153401 | [Jar with Dragon Design](https://www.clevelandart.org/art/1986.85) | Creator not recorded | 1700s | Cleveland Museum of Art | CC0. Leonard C. Hanna Jr. Fund |
| cma-160952 | [Black Horseman in Front of a Doorway](https://www.clevelandart.org/art/1999.22) | Creator not recorded | c. 1855 | Cleveland Museum of Art | CC0. John L. Severance Fund |
| cma-165269 | [Textile Fragment](https://www.clevelandart.org/art/2007.2.3) | Creator not recorded | c. 50–650 CE | Cleveland Museum of Art | CC0. John L. Severance Fund |
| cma-171296 | [Vale of Kashmir](https://www.clevelandart.org/art/2014.12) | Robert S. Duncanson | 1867 | Cleveland Museum of Art | CC0. Sundry Purchase Fund |
| cma-93239 | [Still Life](https://www.clevelandart.org/art/1926.1664) | Preston Dickinson | c. 1924 | Cleveland Museum of Art | CC0. Hinman B. Hurlbut Collection |
| cma-98627 | [The Age of Bronze](https://www.clevelandart.org/art/1918.328) | Auguste Rodin | 1875–1876 | Cleveland Museum of Art | CC0. Gift of Mr. and Mrs. Ralph King |
| met-248899 | [Ten marble fragments of the Great Eleusinian Relief](https://www.metmuseum.org/art/collection/search/248899) | Creator not recorded | c. 27 BCE–14 CE | The Metropolitan Museum of Art | Public Domain. Rogers Fund, 1914 |
| met-315786 | [Shirt](https://www.metmuseum.org/art/collection/search/315786) | Moche artist(s) | 500–850 CE | The Metropolitan Museum of Art | Public Domain. Bequest of Jane Costello Goldberg, 1986 |
| met-317700 | [Mirror Frame](https://www.metmuseum.org/art/collection/search/317700) | Creator not recorded | 10th–15th century | The Metropolitan Museum of Art | Public Domain. Gift of Carol R. Meyer, 1994 |
| met-329077 | [Head of a ruler](https://www.metmuseum.org/art/collection/search/329077) | Creator not recorded | c. 2300–2000 BCE | The Metropolitan Museum of Art | Public Domain. Rogers Fund, 1947 |
| met-435658 | [Madonna and Child](https://www.metmuseum.org/art/collection/search/435658) | Berlinghiero | c. 1230s | The Metropolitan Museum of Art | Public Domain. Gift of Irma N. Straus, 1960 |
| met-436105 | [The Death of Socrates](https://www.metmuseum.org/art/collection/search/436105) | Jacques Louis David | 1787 | The Metropolitan Museum of Art | Public Domain. Catharine Lorillard Wolfe Collection, 1931 |
| met-436532 | [Self-Portrait with a Straw Hat](https://www.metmuseum.org/art/collection/search/436532) | Vincent van Gogh | 1887 | The Metropolitan Museum of Art | Public Domain. Bequest of Miss Adelaide Milton de Groot, 1967 |
| met-436535 | [Wheat Field with Cypresses](https://www.metmuseum.org/art/collection/search/436535) | Vincent van Gogh | 1889 | The Metropolitan Museum of Art | Public Domain. Purchase, The Annenberg Foundation Gift, 1993 |
| met-437853 | [Venice, from the Porch of Madonna della Salute](https://www.metmuseum.org/art/collection/search/437853) | Joseph Mallord William Turner | c. 1835 | The Metropolitan Museum of Art | Public Domain. Bequest of Cornelius Vanderbilt, 1899 |
| met-44858 | [Old Plum](https://www.metmuseum.org/art/collection/search/44858) | Kano Sansetsu | 1646 | The Metropolitan Museum of Art | Public Domain. The Harry G. C. Packard Collection, 1975 |
| met-45434 | [Under the Wave off Kanagawa (The Great Wave)](https://www.metmuseum.org/art/collection/search/45434) | Katsushika Hokusai | c. 1830–1832 | The Metropolitan Museum of Art | Public Domain. H. O. Havemeyer Collection, 1929 |
| met-544227 | [Hippopotamus ("William")](https://www.metmuseum.org/art/collection/search/544227) | Creator not recorded | c. 1961–1878 BCE | The Metropolitan Museum of Art | Public Domain. Gift of Edward S. Harkness, 1917 |

## Known limitations

- Open-access rights and image availability constrain the sample. The final catalog has no postwar or contemporary work, so it cannot represent those periods responsibly.
- Painting is more frequent than photography and works on paper; role assignment preserves variety but cannot remove every medium imbalance.
- Seven culture/region values and eleven artist/maker values are absent or not specific enough for a named-creator label; the app uses neutral missing-value language.
- Movement/style labels necessarily combine modern movements with schools, period styles, and cultural traditions because the catalog spans paintings, photographs, armor, textiles, ceramics, and ancient objects. They are concise browsing labels, not claims that all art traditions share one taxonomy.
- CLIP concept scores can reflect model and prompt bias. They are used as cautious, inspectable signals and must not be treated as authoritative art-historical classification.
- The image-preparation dependency tree currently reports two high-severity advisories in its transitive `sharp` package with no available package-manager fix. The dependency runs only during trusted local preparation and is not loaded by the deployed browser.
