# Dashboard UI for vantray

## Requirements

For development, you will only need Node.js installed on your environement.

### Node

[Node](http://nodejs.org/) is really easy to install & now include [NPM](https://npmjs.org/).
This project has been developed on the Nodejs v24.22.0 so if you faced any issue during installation that may related to the node version, install Node with version >= v24.22.0.

### Configure app

Copy `.env.example` to `.env` and replace the variables as needed, then set the backend api address:

```bash
cp .env.example .env
```

    VITE_BASE_API=https://somewhere.com/

#### Environment variables

| Name          | Description                                                                          |
| ------------- | ------------------------------------------------------------------------------------ |
| VITE_BASE_API | The api url of the deployed backend ([Vantray](https://github.com/vantray/panel)) |

## Start development server

    pnpm dev

## Simple build for production

    pnpm build

## Contribution

Feel free to contribute. Go on and fork the project. After commiting the changes, make a PR. It means a lot to us.
