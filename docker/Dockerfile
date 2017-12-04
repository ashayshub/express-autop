FROM node:8.9.1
RUN apt-get update && \
     apt-get install git -y
RUN git clone https://github.com/ashayshub/express-autop.git /app
#COPY ./ /app
WORKDIR /app
RUN npm install

ENV LC_ALL=C.UTF-8
ENV LANG=C.UTF-8

ENV DEBUG 1

ENTRYPOINT ["node"]
CMD ["./index.js"]
