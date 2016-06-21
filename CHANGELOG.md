# bedrock-idp ChangeLog

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
