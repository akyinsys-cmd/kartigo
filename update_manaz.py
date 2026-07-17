import re

with open("src/components/DocumentAgent.tsx", "r") as f:
    content = f.read()

# Replace welcome texts
content = content.replace(
    "'Hello 👋 Welcome to Kartigo Draft.\\n\\nTell me what document you would like to create today.'",
    "'Hello! I\\'m Manaz, your document assistant.\\n\\nTell me what document you\\'d like to create today.'"
)

# Replace agent reply
content = content.replace("Got it: **${cleanInput}**.\\n\\nNext question. ${nextQuestion.questionText}", "Got it: **${cleanInput}**.\\n\\n${nextQuestion.questionText}")
content = content.replace("We have gathered all the necessary parameters for your **${currentDocType}**.\\n\\nI have saved your draft securely. Click **Save Draft** or check the side panel to review. We're ready for high-fidelity document packaging! 📄🎉", "I have gathered all the necessary parameters for your **${currentDocType}**.\\n\\nI have saved your draft securely. Click **Save Draft** or check the side panel to review. We're ready for high-fidelity document packaging! 📄🎉")

# Replace generation stage texts
def replacer(match):
    return """{generationStage === 'validating' && 'Manaz is reviewing your requirements...'}
              {generationStage === 'analyzing' && 'Manaz is reviewing your requirements...'}
              {generationStage === 'missing_info' && 'Manaz found a few details that need confirmation.'}
              {generationStage === 'structuring' && 'Manaz is preparing your document...'}
              {generationStage === 'intel' && 'Manaz is preparing your document...'}
              {generationStage === 'quality' && 'Manaz is preparing your document...'}
              {generationStage === 'risk_check' && 'Manaz is preparing your document...'}
              {generationStage === 'saving' && 'Manaz has finished preparing your document.'}
              {generationStage === 'done' && 'Manaz has finished preparing your document.'}"""

content = re.sub(r"\{generationStage === 'validating' && 'Kartigo Validation Engine is parsing all collected fields.*?(?=\s*</div>)", replacer, content, flags=re.DOTALL)

with open("src/components/DocumentAgent.tsx", "w") as f:
    f.write(content)
print("Updated DocumentAgent.tsx")

