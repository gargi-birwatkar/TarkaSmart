import asyncio
import json
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type
import os
import sys
from pydantic import BaseModel
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

sys.path.append(root_dir)

from backend.student_backend import chat_handler

questions = [

    "Why is follower dependency considered a fundamental requirement of leadership?",

    "In the context of MBO, why is it vital for superiors to consult subordinates when determining their objectives?",

    "How does the 'Recycling Objectives' stage in the MBO process function?",

    "What is a primary difference in communication flow between centralized and decentralized organizations?",



    "How is control and evaluation achieved in a decentralized organization?",

    "What are the five key aspects a planner must think about when outlining steps to reach objectives?",

    "What does the 'Awareness of Opportunities' step in the planning process involve?",

    "Why is 'Budgeting' considered the last stage of the planning process?",

    "How does planning facilitate 'Management by Exception'?",

    "What is a significant psychological limitation of the planning process?"

]



answers = [

    "Leadership cannot occur in isolation and relies entirely on having a group of followers who are willing to be guided towards a vision[cite: 1].",
    "Mutual acceptance is vital because it significantly increases employee commitment towards achieving the defined objectives[cite: 1].",
    "The outcome of a performance appraisal is used to redraft superior objectives or modify organizational structures because the stages are interrelated[cite: 1].",

    "In centralized organizations, the flow is primarily vertical and top-down through a strict chain of command, whereas in decentralized organizations, communication flows more freely in multiple directions, including horizontally between departments[cite: 1].",

   

    "Control is achieved indirectly through broad policies, performance metrics, and departmental reporting, with evaluation focusing on the overall results achieved by autonomous managers[cite: 1].",

    "A planner must think about what is to be done, how it is to be done, when it is to be done, by whom it is to be done, and where it is to be done[cite: 2].",

    "It involves a preliminary understanding and estimation of opportunities available from the environment—such as changing customer needs, technological changes, or competitor weaknesses—and analyzing them in light of the organization's strengths and weaknesses[cite: 2].",

    "Budgeting is the last stage because it is a numberised plan that allocates resources to required activities, effectively putting the plan into action[cite: 2].",

    "By fixing organizational objectives, management only needs to interfere in other aspects when things are not going well, which frees up managers' time for planning[cite: 2].",

    "There is a degree of conservatism in people, which implies a resistance to change and creates hurdles in the success of planning[cite: 2]."

]
class RequestModel(BaseModel):
    message: str
    google_user_id: str
# 1. Add a retry strategy to the chat_handler call
@retry(
    wait=wait_exponential(multiplier=2, min=60, max=120), # Wait longer on each failure
    stop=stop_after_attempt(5),
    retry=retry_if_exception_type(Exception) # Catch API errors, timeouts, etc.
)
async def safe_chat_handler(req):
    return await chat_handler(req)

async def generate():
    questions_list = []
    contexts_list = []
    answers_list = []
    ground_truth_list = []

    for i, j in zip(questions, answers):
        print(f"Processing question: {i[:30]}...")
        
        request = {"message": i, "google_user_id": "TARKA_GUEST_MOCK_101"}
        req = RequestModel(**request)
        
        # Call the retry-wrapped handler
        data = await safe_chat_handler(req)
        
        # Append as strings/lists, NOT as sets (remove the {})
        questions_list.append(i)
        contexts_list.append([data["chunks"]]) # Keep as a list of strings
        answers_list.append(data["answer"])
        ground_truth_list.append(j)
        
        # Polite delay to stay within Free Tier limits
        # 5-10 seconds is usually enough to avoid the 20-req/min limit
        print("Sleeping for 65 seconds to respect free tier quota...")
        await asyncio.sleep(65)
        
    eval_data = {
        "question": questions_list,
        "retrieved_contexts": contexts_list,
        "answer": answers_list,
        "ground_truth": ground_truth_list
    }

    with open("eval_dataset.json", "w") as f:
        json.dump(eval_data, f, indent=4)
    print("Dataset generated successfully!")

if __name__ == "__main__":
    asyncio.run(generate())