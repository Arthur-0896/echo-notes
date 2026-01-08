# Echo-Notes

## Project info

An AI-powered speech summarizer that records audio, transcribes it with AWS Transcribe, and generates concise summaries using Amazon Bedrock. User authentication and summary history are managed via AWS Cognito and DynamoDB (Todo). The application leverages S3 event notifications to trigger Lambda functions that automate the transcription and summarization workflow.

## Architecture diagram
![summarizer](https://github.com/user-attachments/assets/57a52c11-7d9a-429f-b721-9c0a0d79faa0)

## Technologies used

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Python
- AWS (Bedrock, Transcribe, Lambda, S3) & DynamoDB, Cognito (Not yet implemented)

*Front-end generated using [lovable.dev](https://lovable.dev/)*
