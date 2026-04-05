# 1. Use the official lightweight Python image
FROM python:3.10-slim

# 2. Set the directory where your code will live inside the container
WORKDIR /app

# 3. Copy the requirements file first (this makes builds faster)
COPY requirements.txt .

# 4. Install the libraries from your list
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy all your files (app.py, templates, static, etc.) into the container
COPY . .

# 6. Tell Docker to listen on port 5000
EXPOSE 5000

# 7. Start the app using Gunicorn
# "app:app" means: look in app.py for the variable named "app"
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]