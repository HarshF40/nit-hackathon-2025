import base64
import requests
import json
import sys

def encode_image_to_base64(image_path):
    """
    Read an image file and encode it to base64
    """
    try:
        with open(image_path, 'rb') as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
        return encoded_string
    except FileNotFoundError:
        print(f"❌ Error: Image file not found at '{image_path}'")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error reading image: {str(e)}")
        sys.exit(1)

def test_image_api(image_path, query, api_url="http://localhost:5000/img"):
    """
    Test the image API by sending a base64 encoded image
    """
    print(f"📷 Reading image from: {image_path}")
    
    # Encode image to base64
    base64_image = encode_image_to_base64(image_path)
    print(f"✅ Image encoded successfully (length: {len(base64_image)} characters)")
    
    # Prepare the request payload
    payload = {
        "query": query,
        "image": base64_image
    }
    
    print(f"📤 Sending request to: {api_url}")
    print(f"💬 Query: {query}")
    print("⏳ Waiting for response...")
    
    try:
        # Send POST request to the API
        response = requests.post(
            api_url,
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=300  # 5 minutes timeout
        )
        
        # Check if request was successful
        if response.status_code == 200:
            result = response.json()
            print("\n" + "="*50)
            print("✅ SUCCESS!")
            print("="*50)
            print(f"\n📝 Response from Gemini:\n")
            print(result.get('response', 'No response'))
            print("\n" + "="*50)
        else:
            print(f"\n❌ Error: API returned status code {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.Timeout:
        print("❌ Error: Request timed out after 5 minutes")
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to the API. Is it running?")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_text_api(query, api_url="http://localhost:5000/receive"):
    """
    Test the text-only API endpoint
    """
    print(f"💬 Query: {query}")
    print(f"📤 Sending request to: {api_url}")
    print("⏳ Waiting for response...")
    
    try:
        # Send POST request to the API
        response = requests.post(
            api_url,
            json={"query": query},
            headers={'Content-Type': 'application/json'},
            timeout=300
        )
        
        if response.status_code == 200:
            result = response.json()
            print("\n" + "="*50)
            print("✅ SUCCESS!")
            print("="*50)
            print(f"\n📝 Response from Gemini:\n")
            print(result.get('response', 'No response'))
            print("\n" + "="*50)
        else:
            print(f"\n❌ Error: API returned status code {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")


if __name__ == "__main__":
    print("="*50)
    print("🧪 API Testing Script")
    print("="*50 + "\n")
    
    # Example 1: Test with image
    print("📋 Test 1: Image Analysis")
    print("-"*50)
    
    # CHANGE THIS to your image path
    image_path = "/home/harsh/Downloads/Wallpapers/wallhaven-218x7m.jpg"  # ⚠️ REPLACE WITH YOUR IMAGE PATH
    query = "What's in this image? Describe it in detail."
    
    test_image_api(image_path, query)
    
    print("\n\n")
    
    # Example 2: Test text-only endpoint (optional)
    print("📋 Test 2: Text Query (Optional)")
    print("-"*50)
    
    # Uncomment below to test text-only endpoint
    # test_text_api("What is the capital of France?")
