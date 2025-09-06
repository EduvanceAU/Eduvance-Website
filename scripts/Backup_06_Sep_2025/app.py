import csv
actual = ["0461b3ce-6a8c-4760-af66-e1aeadb56cf4",
"0c575d85-c406-4aa3-8245-244453256009",
"18b3b4c5-04b1-481a-be25-f6125dc9eb0c",
"2010968d-725a-4530-94b8-04a3b2e5f8cd",
"437b1db6-7816-4c44-8128-da966e186d80",
"45da5f35-0487-44ae-af0e-01761313650e",
"4b0c253a-8d47-418b-b015-59d073f96cd7",
"6450faca-c2e0-4157-b683-2e6278a3c321",
"64ff1c7e-18e0-4de4-b800-44e09d70b97c",
"7edc7325-0209-456b-b290-c12ba3ac0988",
"814b7be0-1aa5-4f8a-a708-1986c14349bd",
"81c06239-5dad-46ec-875a-55c2f466a5f3",
"888074b5-6e92-4e59-8e06-e2e8b76dcba5",
"96110453-e73e-4a66-b19b-b8796d19f2f6",
"a259da82-5e76-4403-8115-20a348d68e56",
"af1a04dc-9e1d-4c5f-ae6c-30679d7a8635",
"b950c898-4a7e-4b02-a51e-b5bfcee7a345",
"c77b6894-b523-4780-b946-d0a2f26c59e2",
"d054d19a-4821-4986-9c5e-bbe982de9a23",
"d8d0172e-df35-4a81-b7d3-81f107229253",
"e7734067-bbaa-45b0-908a-505eca7c114c",
"ed8904a7-ed99-4920-bafa-19453f448884",
"f62a81ef-032a-4074-9733-c956ffef7abb",
"fec2dea1-1f28-416e-bb95-75833c8663fd"]
todo = set()
name = "resources_rows (3).csv"
column = 1 # Column Containing Subject ID
with open(name, newline="", encoding="utf-8") as file:
    reader = csv.reader(file)
    for row in reader:
        if row[column] not in actual:
            todo.add(row[column])

for row in todo:
    print(row)            
