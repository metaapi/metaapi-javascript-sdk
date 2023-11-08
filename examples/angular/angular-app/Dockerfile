# docker build -t metaapi-angular-app-example -f Dockerfile .
# docker run -d -p 4200:4200 metaapi-angular-app-example

FROM node:lts-hydrogen

RUN npm install -g --silent @angular/cli@latest
COPY . /app/angular

WORKDIR /app/angular/
RUN npm install --silent

EXPOSE 4200

CMD ["ng", "serve", "--host", "0.0.0.0"]
