## ednel-v1.0.4 (2026-09-11)

> Derivative work by the **EDNEL-RIOJA** project team for **CNIE-ES**, based on the upstream
> fe-authentication-provider `2.9.0` release (commit `82740ef`). Modified between
> **2026-03-03 and 2026-09-11**, licensed under EUPL-1.2 like the original work. See
> [NOTICE.EDNEL.md](NOTICE.EDNEL.md) for the full modification notice.

### Added (2026-03-03 → 2026-07-09)

- **Additional languages**: Catalan, Basque, Galician and Valencian translation files, and tests
  for the language selector.
- **EDNEL branding**: `ednel-full-logo.svg` and a user profile icon, replacing the SIMPL logo.
- **Home redirect guard** with its tests, and a spec for the EDNEL application component.
- Three **GitHub Actions workflows**: image build and push with automatic `ednel-v1.0.x` tagging,
  pull request checks, and a job that syncs from the upstream repository.
- `yarn.lock`, pinning the dependency tree.

### Changed (2026-03-03 → 2026-07-09)

- **Look and feel**: design system colours, table header colours, cell padding, border radius and
  font sizes, tab title weight, spinner text, colours and animation delay.
- **Layout**: header fixed so it no longer hides page titles, content constrained to the viewport,
  responsive credentials table, filter height no longer exceeding the table, main content layout
  and SCSS rules reorganised.
- **Navigation**: home navigation fixed and a slash added to the logout return path.
- **Translations**: missing non-EU translation files no longer raise an HTTP error.

### Removed (2026-07-01)

- `src/assets/images/logo/simpl-logo.svg`, replaced by the EDNEL logo. This is the only file of the
  original work that this fork removes, and it also keeps the licensor's mark out of the published
  interface, which Art. 5 of the EUPL (Legal Protection) asks for.

### Licence compliance (2026-09-10 → 2026-09-11)

Notices required by Art. 5 of the EUPL-1.2 (Attribution right, Provision of Source Code) for this
derivative work:

- `NOTICE.EDNEL.md`: modification notice stating that the work has been modified, by whom, when and
  what was changed, with the repository where the complete corresponding source code is available.
- `README.md`: prominent notice at the top of the file identifying this repository as a modified
  version of fe-authentication-provider, plus a Licence section.
- `LICENSE`: the full official text of the EUPL-1.2 is now reproduced in the file, which previously
  only linked to it, so that a copy of the Licence travels with every copy of the Work. The
  original SIMPL heading is kept intact.
- `Dockerfile`: OCI image labels (`licenses`, `source`, `vendor`, `description`) and `LICENSE` and
  `NOTICE.EDNEL.md` copied into the image, so the notices and the pointer to the source code travel
  with the published container image.
- `package.json`: `description` and `repository` added, so that the source repository is stated in
  the package metadata too.
- `.github/workflows/build-push.yml`: the container image namespace is derived from the repository
  owner instead of being hard-coded, so that the published image and the source code it is built
  from always live in the same organisation.
- Automatic tagging switched off in the same workflow. It bumped the patch and pushed a new
  `ednel-v1.0.x` git tag on every merge to `ednel`, so the released version moved without anyone
  deciding it and drifted from what this changelog, the README, the chart `appVersion` and the
  modification notice declare. The release version is now whatever tag was created on purpose, and
  the image is published under that same tag; the pipeline fails if no release tag exists.
- `NOTICE.EDNEL.md` records where the third-party licences travel: this repository ships no
  `NOTICE` or `THIRD_PARTY_LICENCES` file, and the licences of the packages embedded in the Angular
  bundle reach the image as `3rdpartylicenses.txt`, which `angular.json` emits under the default
  `production` configuration. Making that explicit turns an incidental arrangement into a stated
  one (2026-09-11).
- Helm chart made loadable outside the upstream GitLab pipeline: `Chart.yaml` and `values.yaml`
  carried unsubstituted `${PROJECT_RELEASE_VERSION}` and `${CI_REGISTRY_IMAGE}` placeholders, which
  that pipeline replaced and which made the chart fail to load anywhere else. `image.repository`
  now defaults to the published image of this fork.


## 2.7.0 (2025-11-10)

### changed (1 changes)

- Monorepo splitting. Please refer to old [CHANGELOG.md](https://code.europa.eu/simpl/simpl-open/development/iaa/simpl-fe/-/blob/main/CHANGELOG.md) for more details.

