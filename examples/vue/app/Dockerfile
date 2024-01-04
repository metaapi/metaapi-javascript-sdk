# docker build -t metaapi-app-example -f Dockerfile .
# docker run -d -p 5173:5173 metaapi-app-example

FROM node:lts-hydrogen

COPY . /app/vue

WORKDIR /app/vue/
RUN npm install --silent

EXPOSE 5173

CMD ["npm", "run", "dev"]
