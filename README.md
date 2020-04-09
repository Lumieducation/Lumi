# Lumi

Lumi is a Desktop App that offers a collection of tools to create, edit and share digital content with your class.

Lumi is currently in a very early development phase and offers only one tool: a H5P Editor.
Other tools will be added in later versions.

Download the latest version [here](https://github.com/Lumieducation/Lumi/releases/latest).

![Lumi](./docs/img/lumi_flow.png)

It’s built with TypeScript – a [nodejs](https://nodejs.org/) plus [express](https://expressjs.com/) and [socket.io](http://socket.io) server, [React.js](https://reactjs.org/), [Redux](https://redux.js.org/) and [Material-ui](https://www.material-ui.com).
It runs as a [Electron](https://electronjs.org)-Standalone App on Mac OS X, Windows and Linux.

## Development

You can start the development environment on your local machine by following these steps:

1. Make sure you have [`git`](https://git-scm.com/), [`node`](https://nodejs.org/), and [`npm`](https://www.npmjs.com/get-npm) installed.
2. Clone this repository locally.
3. Execute `npm install` from the root directory of the repository.
4. Execute `npm run client` from the root directory of the repository.
5. Open a second termilnal and execute `npm run server` from the root directory of the repository.

This will launch the an instance of electron & the backend-server.

## Contributing

Lumi tries to improve education wherever it is possible by providing a software that connects teachers with their students. But Lumi is in a very early development stage. Every help is appreciated and welcome. You can contribute in many ways. You can help reporting, testing, and detailing bugs, and also test and suggest new features.
Please read [CONTRIBUTING.md](./.github/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

Lumi has adopted the code of conduct defined by the Contributor Covenant. It can be read in full [here](./CODE-OF-CONDUCT.md).

### Get in touch

[Slack](https://join.slack.com/t/lumi-education/shared_invite/enQtMjY0MTM2NjIwNDU0LWU3YzVhZjdkNGFjZGE1YThjNzBiMmJjY2I2ODk2MzAzNDE3YzI0MmFkOTdmZWZhOTBmY2RjOTc3ZmZmOWMxY2U) or [c@Lumi.education](mailto:c@Lumi.education).

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/Lumieducation/Lumi/tags).

## License

This project is licensed under the GNU AFFERO GENERAL PUBLIC LICENSE v3 License - see the [LICENSE](LICENSE) file for details
