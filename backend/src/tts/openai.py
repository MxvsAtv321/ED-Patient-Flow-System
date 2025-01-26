import openai

def get_chatgpt_response(prompt):
    response = openai.Completion.create(
        model="gpt-3.5-turbo", 
        prompt=prompt,
        max_tokens=150
    )
    return response.choices[0].text.strip()
