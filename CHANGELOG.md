# bedrock-idp ChangeLog

## 6.0.1 - 2018-03-26

### Changed
- Update dependencies.

## 6.0.0 - 2018-03-26

### Changed
- **BREAKING**: Switch to material design.
- Use ES6 syntax.
- Updated dependencies.

### Removed
- **BREAKING**: Remove bower support.

## 5.1.6 - 2016-11-11

### Changed
- Use `sameAs` directive on confirm password field in join form.
- Update Protractor test suite and dependencies.

## 5.1.5 - 2016-10-31

### Changed
- Improve test suite.

## 5.1.4 - 2016-10-14

### Fixed
- Improve validation of `Short Name` field.

## 5.1.3 - 2016-09-14

### Fixed
- Remove erroneous bower dependency on bedrock-angular-messages.

## 5.1.2 - 2016-09-13

### Fixed
- Fix referrer bug with IE11; `document.referrer` is reset when
  `$location.url` is called which causes redirection to fail
  on IE11 once the dashboard is loaded. This fix performs the
  redirection early when `auto` is true.

## 5.1.1 - 2016-09-01

### Changed
- Modernize duplicate checker directive.

## 5.1.0 - 2016-08-16

### Added
- Record agreements during the join process.
- Add route resolver to check service agreements.

## 5.0.16 - 2016-07-22

### Fixed
- Update bower.json `ignore`.

## 5.0.15 - 2016-07-22

### Fixed
- Update bower.json `ignore`.

## 5.0.14 - 2016-07-22

### Fixed
- Only accept lower case email addresses.

## 5.0.13 - 2016-07-21

### Changed
- Use credentials-polyfill 0.10.x.

## 5.0.12 - 2016-07-20

### Changed
- Update bedrock-identity-http dependency.

## 5.0.11 - 2016-07-14

### Fixed
- Throw error when DID registration is canceled.

## 5.0.10 - 2016-07-12

### Changed
- Improve join form validation and tests.
- Include `email` as human readable identifier for DID registration.

## 5.0.9 - 2016-07-07

### Changed
- Update deps.

## 5.0.8 - 2016-07-07

### Changed
- Refactor tests.
- Refactor identity components.

## 5.0.7 - 2016-06-29

### Fixed
- Credential deletion.

## 5.0.6 - 2016-06-28

### Changed
- Create create-identity-component and tests.
- Restructure repo in support of new testing conventions.

## 5.0.5 - 2016-06-21

### Changed
- Identities without fields marked as public will return minimal information
  rather than a 404.
- Use identity component. Remove old identity displayer.
- Use `bedrock-angular-authn` to handle invalid/missing session checking.

### Removed
- Remove broken `/session/login` route.

## 5.0.4 - 2016-06-13

### Changed
- Update bedrock-angular-message dependency.

## 5.0.3 - 2016-06-08

### Changed
- Re-implement informational messages during DID recovery.

## 5.0.2 - 2016-06-07

### Changed
- Update dependencies.

## 5.0.1 - 2016-06-02

### Fixed
- Do a brResourceService.refresh() after join process.

## 5.0.0 - 2016-05-30

### Changed
- **BREAKING**: Breaking changes in some dependencies such as
`bedrock-credentials-mongodb`.
- Moved authentication functions into `bedrock-authn` modules.

## 4.1.1 - 2016-04-29

## 4.1.0 - 2016-04-19

### Added
- Show credentials list on identity page.

## 4.0.1 - 2016-04-19

### Changed
- Render identity page using AngularJS.

## 4.0.0 - 2016-03-15

### Changed
- Update bedrock dependencies.
- Update bedrock-angular modules to 2.x.

## 3.0.3 - 2016-03-27

### Changed
- Use credentials-polyfill 0.8.x.

## 3.0.2 - 2016-03-26

### Changed
- Fix-up references to bedrock-session-http.

## 3.0.1 - 2016-03-25

### Changed
- Update bedrock-session-http deps.

## 3.0.0 - 2016-03-03

### Changed
- Update package dependencies for npm v3 compatibility.

### Added
- Add credentials menu tab and UI.
- Add test credentials for test mode.

## 1.0.3 - 2015-07-16

### Changed
- Depend on forge and fix paths.
- Update bedrock-identity version.

### Fixed
- Fix error handling bugs.

## 1.0.2 - 2015-05-07

### Fixed
- Fix idp data access.
- Upgrade tests to work with bedrock-protractor v2.

## 1.0.1 - 2015-04-09

### Changed
- Move `bedrock.config.identityCredentials.*` to `bedrock.config.idp.*`.
- Fixed dependencies for testing.

### Deprecated
- `bedrock.config.identityCredentials.*`

## 1.0.0 - 2015-04-08

### Changed
- Change "app" to "bedrock" in module name.

## 0.1.4 - 2015-03-13

### Fixed
- Fix config typo.

## 0.1.3 - 2015-03-13

### Changed
- Add view context var once in config vs in every addViewVars call.

## 0.1.2 - 2015-02-25

### Added
- Config namespace `config.identityCredentials`.
- `allowInsecureCallback` config value.

## 0.1.1 - 2015-02-23

### Fixed
- `identity` param.

## 0.1.0 - 2015-02-23

- See git history for changes.
