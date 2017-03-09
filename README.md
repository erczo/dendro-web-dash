# Dendro Web Dashboards

TODO: Briefly describe this repo and Project Dendro


## Instructions

1. Be sure you have Node version 6.5.x. If you’re using nvm, you may need to `nvm use 6.5.0`.

2. Clone this repo.

3. Make this project directory the current directory, i.e. `cd dendro-web-dash`.

4. Install modules via `npm install`.

5. Install webmodules:

	```bash
	$ npm install -g webmodules
	$ wpm install
	```

6. If all goes well, you should be able to run the predefined package scripts.


## To build and publish the Docker image

1. Make this project directory the current directory, i.e. `cd dendro-web-dash`.

2. Build the project `docker build -t dendro:dendro-web-dash .`.

3. Tag the desired image, e.g. `docker tag f0ec409b5194 dendro/dendro-web-dash:latest`.

4. Push it via `docker push dendro/dendro-web-dash`.
