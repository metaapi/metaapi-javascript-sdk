# docker build -t metaapi-react-app-example -f Dockerfile .
# docker run -d -p 5173:5173 metaapi-react-app-example

FROM node:lts-hydrogen

COPY . /app/react

WORKDIR /app/react/
RUN npm install --silent

EXPOSE 5173

CMD ["npm", "run", "dev"]
