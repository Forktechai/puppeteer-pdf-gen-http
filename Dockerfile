# FROM public.ecr.aws/lambda/nodejs:16 as builder
# WORKDIR /usr/app
# COPY . .
# RUN npm install typescript -g
# RUN npm install
# RUN npm run build
    

# FROM public.ecr.aws/lambda/nodejs:16
# WORKDIR ${LAMBDA_TASK_ROOT}
# COPY test_input.json ./
# COPY --from=builder /usr/app/dist/* ./
# EXPOSE 8080
# CMD ["index.handler"]

FROM public.ecr.aws/lambda/nodejs:16.2023.11.10.17
WORKDIR ${LAMBDA_TASK_ROOT}
RUN npm install -g pnpm typescript
COPY package.json pnpm-lock.yaml ./
COPY fonts ./fonts
RUN pnpm install
COPY public ./public
COPY *.ts *.json ./
RUN pnpm run build
EXPOSE 8080
CMD ["index.handler"]