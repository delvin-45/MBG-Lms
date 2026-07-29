import os
import glob

pages_dir = r'd:\mbg-my better grade\frontend\src\pages'
files = glob.glob(pages_dir + '/**/*.jsx', recursive=True)
replaced = 0

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    # Fix active sidebar items
    new_content = new_content.replace('bg-[#F080C0] py-3 px-4  cursor-pointer w-full text-[#2E1A28]', 'bg-[#F080C0] py-3 px-4 cursor-pointer w-[calc(100%-1.5rem)] mx-3 rounded-full text-[#2E1A28]')
    new_content = new_content.replace('bg-[#E040A0] py-3 px-4  cursor-pointer w-full text-[#2E1A28]', 'bg-[#E040A0] py-3 px-4 cursor-pointer w-[calc(100%-1.5rem)] mx-3 rounded-full text-[#2E1A28]')
    new_content = new_content.replace('bg-[#F080C0] py-3 px-4  cursor-pointer w-full shadow-sm', 'bg-[#F080C0] py-3 px-4 cursor-pointer w-[calc(100%-1.5rem)] mx-3 rounded-full shadow-sm')
    
    # Fix active item missing text color
    new_content = new_content.replace('bg-[#F080C0] py-3 px-4  cursor-pointer w-full"', 'bg-[#F080C0] py-3 px-4 cursor-pointer w-[calc(100%-1.5rem)] mx-3 rounded-full"')
    
    # Fix hover sidebar items
    new_content = new_content.replace('py-3 px-4  cursor-pointer w-full hover:bg-purple-50', 'py-3 px-4 cursor-pointer w-[calc(100%-1.5rem)] mx-3 rounded-full hover:bg-purple-50')
    new_content = new_content.replace('py-3 px-4  cursor-pointer w-full mt-auto text-red-500 hover:bg-red-50', 'py-3 px-4 cursor-pointer w-[calc(100%-1.5rem)] mx-3 rounded-full mt-auto text-red-500 hover:bg-red-50')

    # Specific fix for DashboardStudent.jsx since it was updated separately before
    new_content = new_content.replace('bg-[#D985B6] py-3 px-4  cursor-pointer w-full', 'bg-[#D985B6] py-3 px-4 cursor-pointer w-[calc(100%-1.5rem)] mx-3 rounded-full')

    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        replaced += 1

print(f'Fixed sidebar in {replaced} files.')
