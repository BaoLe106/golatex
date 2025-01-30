import os
import base64
import boto3
import subprocess
import json
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# S3 configuration
S3_BUCKET = 'golatex--tex-and-pdf-files'
S3_REGION = 'us-west-2'
s3_client = boto3.client('s3')

def handler(event, context):
    logger.info("Lambda function started")
    try:
        logger.info(f"Received event: {json.dumps(event)}")
        session_id = event['session_id']
        tex_filename = event['tex_filename']
        tex_data_base64 = event['tex_file']
        tex_data = base64.b64decode(tex_data_base64)


        tex_path = '/tmp/' + session_id
        if not os.path.exists(tex_path):
            os.makedirs(tex_path)
            logger.info(f"tex path created: {tex_path}")

        tex_file_path = tex_path + '/' + tex_filename
        with open(tex_file_path, 'wb') as f:
            f.write(tex_data)
        logger.info(f".tex file saved to {tex_file_path}")
        
        # Upload .tex file to /tex folder in S3 bucket
        logger.info(f"Uploading {tex_filename} to S3 bucket {S3_BUCKET} in session {session_id}")
        s3_client.upload_file(tex_file_path, S3_BUCKET, f"tex/{session_id}/{tex_filename}")
        logger.info(f"File {tex_filename} successfully uploaded to S3 in session {session_id}")

        # Run pdflatex to compile the .tex file into a .pdf
        try:
            subprocess.run(
                ["pdflatex", f"-output-directory={tex_path}", tex_file_path],
                check=True
            )
            logger.info(f"pdflatex executed successfully for {tex_filename}")
        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"Error running pdflatex: {e}")
        
        pdf_filename = tex_filename.replace(".tex", ".pdf")
        pdf_file_path = tex_file_path.replace(".tex", ".pdf")

        # Upload .pdf file to /pdf folder in S3 bucket
        logger.info(f"Uploading {pdf_filename} to S3 bucket {S3_BUCKET} in session {session_id}")
        s3_client.upload_file(pdf_file_path, S3_BUCKET, f"pdf/{session_id}/{pdf_filename}")
        logger.info(f"File {pdf_filename} successfully uploaded to S3 in session {session_id}")

        return {           
            'message': 'Files processed and uploaded to S3 successfully',
            'tex_file': f"s3://{S3_BUCKET}/tex/{session_id}/{tex_filename}",
            'pdf_file': f"s3://{S3_BUCKET}/pdf/{session_id}/{pdf_filename}"
        }
    except Exception as e:
        logger.error(f"Error processing the file: {e}")
        return {
            'message': 'Error processing the file',
            'error': str(e)
        }
