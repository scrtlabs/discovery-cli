# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.8] - 2019-12-02
### Added
- Added this changelog

### Fixed
- `discovery migrate` now "awaits" for `compile` to finish before running the actual migrations.


## [0.1.7] - 2019-11-28
### Fixed
- Updated project dependencies to their latest versions.

## [0.1.6] - 2019-11-28
### Added
- Added two additional optional arguments to `discovery init` to allow for an automated installation. `-y` answers `yes` to whether to proceed with install and pull images and `--mode` takes either `sw` or `hw` to choose between SGX modes.

## [0.1.5] - 2019-11-23
### Added
- adds check for `smart_contracts` folder in addition to `secret_contracts` (because this function gets called before compile and compile needs to have both folders in place.
- added `.gitignore` to the group of files that are downloaded and created with `disovery init`.

### Fixed
- Refactored `discovery migrate` where it used to hang either for a few minutes or a long time. Now it makes a system call to `truffle migrate`
- Better handling of the existence of the `build` folder, whereas before it used to error out with `Cannot find the expected directory structure`, now creates it when needed.

## [0.1.4] - 2019-10-29
### Added
- Added optional command line argument `-y` to `discovery pull` to automate the pulling of Docker images and not have to require user input.

### Fixed
- Increased nginx (load balancer) upload limit to 20M.

## [0.1.3] - 2019-10-19
### Fixed
- Added `enigma.setTaskKeyPair()` to `test_simple_addition.js` to catch up with the latest release of EnigmaJS `0.3.0`.

## [0.1.2] - 2019-10-19
- Added `enigma.setTaskKeyPair()` to migrations file `2_deploy_contracts.js` to catch up with the latest release of EnigmaJS `0.3.0`.

## [0.1.1] - 2019-10-19
### Fixed
- Upgraded to EnigmaJS version `0.3.0`

## [0.1.0] - 2019-09-26
### Added
- Added functionality to run the Docker network with multiple workers nodes through the `NODES` environment variable.
