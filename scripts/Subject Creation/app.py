import os
import json
import os
from supabase import create_client, Client
from dotenv import load_dotenv
import re

load_dotenv()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(url, key)

for file in os.listdir("./Units"):
    units = json.load(open(f"./Units/{file}", "r", encoding="utf-8"))
    subject_name = re.sub(".json", "", file)
    if subject_name.find("(") != -1:
        subject_name = subject_name[:subject_name.find("(")-1]
    unique = subject_name[0:2].upper()
    if subject_name.find(" ") != -1:
        buffer =  subject_name.split(" ")
        unique = f"{buffer[0][0]}{buffer[1][0]}".upper()
    
    syllabus_type = "IAL"
    code = f"W{unique}1/ X{unique}11/ Y{unique}11"
    response = (
        supabase.table("subjects")
        .insert({
            "name": subject_name,
            "code": code,
            "syllabus_type": syllabus_type,
            "units": units
        })
        .execute()
    )
    print(f"""
          # {subject_name}
            - {code}
            - {syllabus_type}
            - {units}""")
    
    syllabus_type = "IGCSE"
    code = f"4{unique}1"
    units = [{"name": "Paper 1", "code": f"{code}/1", "unit": "1"}, {"name": "Paper 2", "code": f"{code}/2", "unit": "2"}, {"name": "Paper 1R", "code": f"{code}/1R", "unit": "1R"}, {"name": "Paper 2R", "code": f"{code}/2R", "unit": "2R"}]
    response = (
        supabase.table("subjects")
        .insert({
            "name": subject_name,
            "code": code,
            "syllabus_type": syllabus_type,
            "units": units
        })
        .execute()
    )
    print(f"""
          # {subject_name}
            - {code}
            - {syllabus_type}
            - {units}""")
    