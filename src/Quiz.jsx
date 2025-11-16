import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Play, BarChart, BookOpen, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, Users, Zap, Award, Gauge, Code, ClipboardList, TrendingUp, Cpu, Network, Database, Layers, GitBranch, Terminal, Info } from 'lucide-react';
import { db } from "./firebase";
import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";

const BASE_POINTS_PER_QUESTION = 100;

const TOTAL_QUIZ_TIME_SECONDS = 900; 

const QUESTIONS = {
    Aptitude: [
        { q: "A train running at 72 km/hr passes a pole in 15 seconds. What is the length of the train?", a: ["300m", "200m", "150m", "400m"], correct: "300m" },
        { q: "A can do a piece of work in 10 days and B can do it in 15 days. How long will they take if they work together?", a: ["5 days", "6 days", "8 days", "9 days"], correct: "6 days" },
        { q: "Two pipes A and B can fill a tank in 12 hours and 15 hours respectively. If they are opened alternately for 1 hour each, starting with A, how long will it take to fill the tank?", a: ["13 hours", "13 hours 15 mins", "13 hours 30 mins", "13 hours 20 mins"], correct: "13 hours 20 mins" },
        { q: "What is 15% of 350?", a: ["50", "52.5", "55", "60.5"], correct: "52.5" },
        { q: "A shopkeeper buys an article for $400 and sells it for $480. What is his profit percentage?", a: ["15%", "20%", "25%", "30%"], correct: "20%" },
        { q: "Find the simple interest on $500 for 4 years at 5% per annum.", a: ["$80", "$100", "$120", "$150"], correct: "$100" },
        { q: "Find the compound interest on $1000 at 10% per annum for 2 years.", a: ["$200", "$210", "$220", "$250"], correct: "$210" },
        { q: "The ratio of two numbers is 3:5 and their sum is 80. Find the numbers.", a: ["30, 50", "32, 48", "25, 55", "40, 40"], correct: "30, 50" },
        { q: "The average age of 5 boys is 12 years. If one boy is added, the average becomes 13 years. What is the age of the new boy?", a: ["15 years", "16 years", "17 years", "18 years"], correct: "18 years" },
        { q: "A car covers a distance of 80 km in 2 hours. What is its speed in m/s?", a: ["10 m/s", "11.11 m/s", "12.5 m/s", "15 m/s"], correct: "11.11 m/s" },
        { q: "If 6 men can complete a work in 12 days, how many days will 8 men take to complete the same work?", a: ["8 days", "9 days", "10 days", "12 days"], correct: "9 days" },
        { q: "A cistern is normally filled in 8 hours but takes 2 hours longer to fill because of a leak in its bottom. If the cistern is full, the leak will empty it in:", a: ["20 hours", "30 hours", "40 hours", "45 hours"], correct: "40 hours" },
        { q: "If the selling price is $120 and the cost price is $100, what is the profit?", a: ["$10", "$20", "$30", "$50"], correct: "$20" },
        { q: "In what time will $6000 amount to $7200 at 6% per annum simple interest?", a: ["2 years", "3 years", "3.33 years", "4 years"], correct: "3.33 years" },
        { q: "A mixture of 20 litres contains milk and water in the ratio 3:1. How much water must be added so that the ratio of milk and water becomes 2:1?", a: ["1 litre", "2 litres", "3 litres", "4 litres"], correct: "2 litres" }
    ],
    Logical: [
        { q: "If 'TIGER' is coded as 'QDFHS', how is 'FISH' coded?", a: ["SITG", "RHEI", "EHRG", "ERHS"], correct: "EHRG" },
        { q: "Introducing a man, a woman said, 'His mother is the only daughter of my mother.' How is the woman related to the man?", a: ["Grandmother", "Mother", "Aunt", "Sister"], correct: "Mother" },
        { q: "All dogs are animals. All animals are mammals. Conclusion: All dogs are mammals.", a: ["Only conclusion I follows", "Only conclusion II follows", "Both follow", "Neither follow"], correct: "Both follow" },
        { q: "Find the next number in the series: 2, 6, 12, 20, 30, ?", a: ["40", "42", "44", "48"], correct: "42" },
        { q: "A man walked 5 km towards South and then turned right. After walking 3 km he turned left and walked 5 km. Now in which direction is he from the starting point?", a: ["East", "West", "North-East", "South-West"], correct: "South-West" },
        { q: "In a row of boys, if A who is 10th from the left and B who is 9th from the right interchange their positions, A becomes 15th from the left. How many boys are there in the row?", a: ["23", "24", "25", "28"], correct: "23" },
        { q: "If A is coded as 1, B as 2, and so on, how is 'BEAT' coded?", a: ["25120", "25119", "25118", "25121"], correct: "25120" },
        { q: "Pointing to a photograph, a man said, 'I have no brother or sister but that man's father is my father's son.' Whose photograph was it?", a: ["His own", "His father's", "His son's", "His nephew's"], correct: "His son's" },
        { q: "Statements: Some shirts are pants. All pants are trousers. Conclusion: Some shirts are trousers.", a: ["Only conclusion I follows", "Only conclusion II follows", "Both follow", "Neither follow"], correct: "Only conclusion I follows" },
        { q: "Find the missing term: 1, 4, 9, 16, 25, ?", a: ["30", "36", "49", "50"], correct: "36" },
        { q: "Raju walks 8m East, then turns right and walks 6m. What is the shortest distance from the starting point?", a: ["10m", "12m", "14m", "15m"], correct: "10m" },
        { q: "If the first half of the alphabet is reversed, which letter will be 10th from the right end?", a: ["C", "D", "E", "F"], correct: "D" },
        { q: "How many pairs of letters are there in the word 'CAREFUL' which have as many letters between them in the word as in the English alphabet?", a: ["One", "Two", "Three", "Four"], correct: "Two" },
        { q: "In a certain code language, 'PENCIL' is written as 'QFETDM'. How is 'BOARD' written in that code?", a: ["CPBSF", "CPESF", "CPESE", "CPEAS"], correct: "CPESF" },
        { q: "Arrange the following words in a meaningful sequence: 1. Rain 2. Vaporization 3. Water 4. Condensation 5. Cloud", a: ["3, 2, 5, 4, 1", "3, 2, 4, 5, 1", "2, 3, 5, 4, 1", "1, 2, 3, 4, 5"], correct: "3, 2, 5, 4, 1" }
    ],
    Technical: [
        { q: "Which data structure uses LIFO (Last-In, First-Out) order?", a: ["Queue", "Stack", "Tree", "Linked List"], correct: "Stack" },
        { q: "What is the time complexity of searching an element in a binary search tree (worst case)?", a: ["O(1)", "O(n)", "O(log n)", "O(n log n)"], correct: "O(n)" },
        { q: "Which SQL clause is used to filter records based on specified search criteria?", a: ["SELECT", "FROM", "WHERE", "GROUP BY"], correct: "WHERE" },
        { q: "Which of the following is NOT an OOP concept?", a: ["Inheritance", "Polymorphism", "Compilation", "Encapsulation"], correct: "Compilation" },
        { q: "What protocol is used to resolve IP addresses to MAC addresses?", a: ["TCP", "ARP", "DNS", "ICMP"], correct: "ARP" },
        { q: "The maximum number of nodes in a binary tree of height 'h' is:", a: ["$2^h$", "$2^h - 1$", "$2^{h+1}$", "$2^{h+1} - 1$"], correct: "$2^{h+1} - 1$" },
        { q: "Which of the following is an example of an $O(1)$ operation?", a: ["Linear search", "Accessing an array element", "Sorting an array", "Inserting into a linked list"], correct: "Accessing an array element" },
        { q: "In SQL, which command is used to permanently save any transaction to the database?", a: ["SAVEPOINT", "ROLLBACK", "COMMIT", "TRUNCATE"], correct: "COMMIT" },
        { q: "Encapsulation is the mechanism of bundling the data and the methods that operate on the data.", a: ["True", "False"], correct: "True" },
        { q: "Which layer of the OSI model is responsible for routing data packets?", a: ["Physical Layer", "Data Link Layer", "Network Layer", "Transport Layer"], correct: "Network Layer" },
        { q: "What is the primary characteristic of an algorithm with $O(log n)$ complexity?", a: ["It grows linearly", "Its execution time halves with each operation", "It involves constant time operations", "It halves the input data structure in each step"], correct: "It halves the input data structure in each step" },
        { q: "What is the result of the SQL query: `SELECT COUNT(*) FROM Customers;`", a: ["Calculates the sum of all customer IDs", "Returns the total number of rows in the Customers table", "Returns the maximum customer ID", "Counts the number of distinct customer names"], correct: "Returns the total number of rows in the Customers table" },
        { q: "Which of the following is a 'has-a' relationship in OOP?", a: ["Inheritance", "Association", "Encapsulation", "Abstraction"], correct: "Association" },
        { q: "Which networking device connects multiple devices in a local area network (LAN) and manages traffic based on MAC addresses?", a: ["Router", "Repeater", "Hub", "Switch"], correct: "Switch" },
        { q: "What is the best case time complexity for bubble sort?", a: ["O(n)", "O($n^2$)", "O(log n)", "O(1)"], correct: "O(n)" }
    ]
};

const STUDY_MATERIAL = {
    Aptitude: {
        title: "Aptitude (Quantitative & Reasoning)",
        sections: [
            {
                subtopic: "Time, Speed & Distance",
                icon: Gauge,
                youtube: "https://youtube.com/playlist?list=PLqiY6XcSKzLJa2tTeB6mKobBdE8cLqv6c&si=mtLJYWsZph7e20il",
                content: `
                    <div class="space-y-4 p-4 text-sm">
                        <h4 class="text-lg font-bold text-indigo-700 flex items-center mb-2"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Key Formulas</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>**Fundamental Relation:** $D = S \\times T$.</li>
                            <li>**Unit Conversion:** $\\text{km/hr} \\times \\frac{5}{18} = \\text{m/s}$.</li>
                            <li>**Relative Speed (Opposite Direction):** $S_1 + S_2$. **Relative Speed (Same Direction):** $|S_1 - S_2|$.</li>
                        </ul>
                        <h4 class="text-lg font-bold text-gray-700 flex items-center mt-3 pt-2 border-t border-gray-200"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 4.016A11.955 11.955 0 0012 21.056c3.178 0 6.168-1.037 8.618-2.944z"></path></svg> Solving Techniques</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>**Train Problems:** Total distance covered is the sum of the train's length and the object's length (if it's another train/platform).</li>
                            <li>**Average Speed:** Use $\\frac{\\text{Total Distance}}{\\text{Total Time}}$, not the simple average of speeds.</li>
                        </ul>
                    </div>
                `
            },
            {
                subtopic: "Time and Work",
                icon: Clock,
                youtube: "https://youtube.com/playlist?list=PLOoogDtEDyvtbV-jgkZ0-i-PS2oUmSHk4&si=wWUC68woDdn7g_GN",
                content: `
                    <div class="space-y-4 p-4 text-sm">
                        <h4 class="text-lg font-bold text-indigo-700 flex items-center mb-2"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg> Core Principle</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>**Work Rate:** If a person completes work in $N$ days, their rate is $\\frac{1}{N}$ work per day.</li>
                            <li>**Combined Rate:** When people work together, their individual rates are summed: $\\text{Rate}_A + \\text{Rate}_B$.</li>
                        </ul>
                        <h4 class="text-lg font-bold text-gray-700 flex items-center mt-3 pt-2 border-t border-gray-200"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Key Formulas</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>**Man-Days Formula:** $M_1 D_1 / W_1 = M_2 D_2 / W_2$.</li>
                            <li>**LCM Method:** Use the Least Common Multiple of the days to set a total unit of work for easy calculation of daily rates.</li>
                        </ul>
                    </div>
                `
            },
            {
                subtopic: "Pipes & Cisterns",
                icon: RefreshCw,
                youtube: "https://youtube.com/playlist?list=PLOoogDtEDyvu3PRJ8KFbOQdY0dxnBmDtH&si=9VW5iZTx1ADmzBcz",
                content: `
                    <div class="space-y-4 p-4 text-sm">
                        <h4 class="text-lg font-bold text-indigo-700 flex items-center mb-2"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c1.657 0 3 .895 3 2s-1.343 2-3 2-3 .895-3 2 1.343 2 3 2m0-8V3"></path></svg> Core Analogy</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>This topic is identical to Time and Work. **Inlet Pipes** are positive workers, and **Outlet Pipes (Leaks)** are negative workers.</li>
                            <li>**Leak Rate:** If filling takes $T_1$ hours and filling with a leak takes $T_2$ hours, the leak's time to empty alone is $\\frac{T_1 \\times T_2}{T_2 - T_1}$.</li>
                        </ul>
                        <h4 class="text-lg font-bold text-gray-700 flex items-center mt-3 pt-2 border-t border-gray-200"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Net Flow</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>**Net Rate** $= (\\sum \\text{Inlet Rates}) - (\\sum \\text{Outlet Rates})$.</li>
                            <li>Time to Fill $= \\frac{\\text{Total Capacity (LCM)}}{\\text{Net Rate}}$.</li>
                        </ul>
                    </div>
                `
            },
            {
                subtopic: "Percentage, Profit and Loss",
                icon: TrendingUp,
                youtube: "https://youtube.com/playlist?list=PLOoogDtEDyvvqaKSM-ZkwAqUyjyR402HH&si=k8x_ahwV5fFOqvKt",
                content: `
                    <div class="space-y-4 p-4 text-sm">
                        <h4 class="text-lg font-bold text-indigo-700 flex items-center mb-2"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l2-2 2 2m0 0l2 2 2-2m-2-2v4"></path></svg> Profit/Loss Bases</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>**Profit/Loss (%)** is always calculated on the **Cost Price (CP)** unless specified otherwise.</li>
                            <li>**Discount (%)** is always calculated on the **Marked Price (MP)**.</li>
                        </ul>
                        <h4 class="text-lg font-bold text-gray-700 flex items-center mt-3 pt-2 border-t border-gray-200"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c1.657 0 3 .895 3 2s-1.343 2-3 2-3 .895-3 2 1.343 2 3 2m0-8V3"></path></svg> Key Formulas</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>$\\text{Profit} = \\text{SP} - \\text{CP}$. $\\text{Profit}\\% = \\frac{\\text{Profit}}{\\text{CP}} \\times 100$.</li>
                            <li>$\\text{SP} = \\text{CP} \\times (1 \\pm \\frac{\\text{Rate}}{100})$. Use $+$ for Profit, $-$ for Loss.</li>
                        </ul>
                    </div>
                `
            },
            {
                subtopic: "Simple and Compound Interest",
                icon: Zap,
                youtube: "https://youtube.com/playlist?list=PLOoogDtEDyvudcQ9ODIyJUTEc2xjWupvi&si=4iHc-47CUYjedu3l",
                content: `
                    <div class="space-y-4 p-4 text-sm">
                        <h4 class="text-lg font-bold text-indigo-700 flex items-center mb-2"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c1.657 0 3 .895 3 2s-1.343 2-3 2-3 .895-3 2 1.343 2 3 2m0-8V3"></path></svg> Core Formulas (P = Principal, R = Rate, T = Time)</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>**Simple Interest (SI):** $SI = \\frac{P \\times R \\times T}{100}$. Interest is always constant on the Principal (P).</li>
                            <li>**Compound Interest (CI):** Amount $A = P \\left(1 + \\frac{R}{100}\\right)^T$. Interest is compounded on the running amount.</li>
                        </ul>
                        <h4 class="text-lg font-bold text-gray-700 flex items-center mt-3 pt-2 border-t border-gray-200"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 4.016A11.955 11.955 0 0012 21.056c3.178 0 6.168-1.037 8.618-2.944z"></path></svg> Quick Facts</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>CI is always greater than SI for any period longer than 1 year.</li>
                        </ul>
                    </div>
                `
            },
            {
                subtopic: "Ratio, Proportion & Averages",
                icon: BarChart,
                youtube: "https://youtube.com/playlist?list=PLOoogDtEDyvsF0UHkJSfc5MGqCrs-28K_&si=rRMZzRQ_S8jGHHqG",
                content: `
                    <div class="space-y-4 p-4 text-sm">
                        <h4 class="text-lg font-bold text-indigo-700 flex items-center mb-2"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg> Definition</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>**Ratio:** Comparison of two quantities (e.g., $3:5$). Use the common factor $x$ (e.g., $3x$ and $5x$).</li>
                            <li>**Proportion:** Equality of two ratios ($a:b = c:d$).</li>
                        </ul>
                        <h4 class="text-lg font-bold text-gray-700 flex items-center mt-3 pt-2 border-t border-gray-200"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Averages Strategy</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>**Average:** $\\frac{\\sum \\text{Terms}}{\\text{Count}}$. In complex problems, always derive the **Total Sum** first.</li>
                        </ul>
                    </div>
                `
            }
        ],
    },
    Logical: {
        title: "Logical Reasoning (Verbal & Non-Verbal)",
        sections: [
            {
                subtopic: "Coding & Decoding",
                icon: ClipboardList,
                youtube: "https://youtu.be/RqpuoOubWkk?si=XC7aTfe2bdxwLaKo",
                content: `
                    <div class="space-y-4 p-4 text-sm">
                        <h4 class="text-lg font-bold text-indigo-700 flex items-center mb-2"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4m-12-4l-4 4 4 4"></path></svg> Primary Techniques</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>**Numerical Shift:** Assign numbers ($A=1$, $B=2$) and check for constant difference ($+2$, $-3$) or alternating shifts.</li>
                            <li>**Opposite Letters:** The letters' position numbers sum to 27 (e.g., A is opposite Z, M is opposite N).</li>
                            <li>**Position Reversal:** The letters in the code are in the reverse order of the word.</li>
                        </ul>
                        <h4 class="text-lg font-bold text-gray-700 flex items-center mt-3 pt-2 border-t border-gray-200"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 4.016A11.955 11.955 0 0012 21.056c3.178 0 6.168-1.037 8.618-2.944z"></path></svg> Tip</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>Always map letters to numbers to simplify complex logic into simple arithmetic.</li>
                        </ul>
                    </div>
                `
            },
            {
                subtopic: "Blood Relations",
                icon: Users,
                youtube: "https://youtube.com/playlist?list=PLOoogDtEDyvsCIOQbjSB6r4d80m98TXF-&si=6V6cBfoUQNZVpQM",
                content: `
                    <div class="space-y-4 p-4 text-sm">
                        <h4 class="text-lg font-bold text-indigo-700 flex items-center mb-2"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-3m0 0l-4-4m4 4H3"></path></svg> Family Tree Symbols</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>**Vertical Line:** Represents different generations (Parent $\\uparrow$ Child).</li>
                            <li>**Horizontal Line (Single):** Represents siblings (Brother $\\longleftrightarrow$ Sister).</li>
                            <li>**Horizontal Line (Double):** Represents spouses (Husband $\\longleftrightarrow$ Wife).</li>
                            <li>**Gender:** Use $'+'$ for Male and $'-'$ for Female.</li>
                        </ul>
                        <h4 class="text-lg font-bold text-gray-700 flex items-center mt-3 pt-2 border-t border-gray-200"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Strategy</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>Start decoding complex statements from the **end of the sentence** and work backward toward the speaker.</li>
                        </ul>
                    </div>
                `
            },
            {
                subtopic: "Syllogisms",
                icon: BookOpen,
                youtube: "https://youtube.com/playlist?list=PLOoogDtEDyvsBG38tzlj1Zkd0PLxgZwXV&si=7TsSxhwBUpDWgWvD",
                content: `
                    <div class="space-y-4 p-4 text-sm">
                        <h4 class="text-lg font-bold text-indigo-700 flex items-center mb-2"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg> Core Rule</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>A conclusion must be true in **all possible Venn Diagram representations** of the given statements to be valid.</li>
                            <li>**Complementary Pair:** The 'Either/Or' case applies when conclusions form a complementary pair (e.g., 'Some A are B' and 'No A is B') and both are individually false.</li>
                        </ul>
                        <h4 class="text-lg font-bold text-gray-700 flex items-center mt-3 pt-2 border-t border-gray-200"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Visual Aid</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>Draw both minimal overlap (for 'Some') and maximal separation/overlap possibilities to test all scenarios.</li>
                        </ul>
                    </div>
                `
            },
            {
                subtopic: "Series Completion",
                icon: GitBranch,
                youtube: "https://youtu.be/Eaz3wscCH7w?si=Fr7zUCRRvYL2TxtT",
                content: `
                    <div class="space-y-4 p-4 text-sm">
                        <h4 class="text-lg font-bold text-indigo-700 flex items-center mb-2"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l2-2 2 2m0 0l2 2 2-2m-2-2v4"></path></svg> Common Patterns</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>**Difference Series:** The difference between terms follows a pattern (e.g., $+2, +4, +6$).</li>
                            <li>**Multiplication/Division:** Each term is the previous term multiplied or divided by a constant factor.</li>
                            <li>**Alternating Series:** Two distinct, interwoven series patterns.</li>
                            <li>**Square/Cube Series:** Based on $n^2$, $n^2 \\pm k$, $n^3$, or $n^3 \\pm k$.</li>
                        </ul>
                        <h4 class="text-lg font-bold text-gray-700 flex items-center mt-3 pt-2 border-t border-gray-200"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c1.657 0 3 .895 3 2s-1.343 2-3 2-3 .895-3 2 1.343 2 3 2m0-8V3"></path></svg> Letters</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>Always convert letter series into their numerical equivalents ($1-26$) to simplify pattern recognition.</li>
                        </ul>
                    </div>
                `
            },
            {
                subtopic: "Direction Sense",
                icon: Gauge,
                youtube: "https://youtube.com/playlist?list=PLOoogDtEDyvurBIdRhhsPZ1Si-BdLbyTR&si=IRIOAONIi6dmpOgG",
                content: `
                    <div class="space-y-4 p-4 text-sm">
                        <h4 class="text-lg font-bold text-indigo-700 flex items-center mb-2"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg> Key Movements</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>**Right Turn:** Always 90° Clockwise. **Left Turn:** Always 90° Counter-Clockwise.</li>
                            <li>Standard directions: North, South, East, West, plus sub-directions (NE, NW, SE, SW).</li>
                        </ul>
                        <h4 class="text-lg font-bold text-gray-700 flex items-center mt-3 pt-2 border-t border-gray-200"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-3m0 0l-4-4m4 4H3"></path></svg> Distance Calculation</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>For straight-line displacement, use simple arithmetic.</li>
                            <li>For finding the **shortest distance** between start and end points, apply the **Pythagorean theorem** ($a^2 + b^2 = c^2$).</li>
                        </ul>
                    </div>
                `
            },
            {
                subtopic: "Seating Arrangements",
                icon: Users,
                youtube: "https://youtube.com/playlist?list=PLOoogDtEDyvv8Zw6jyRHpkHqX2IfPR6bM&si=0v-1Ah-MfBRtQs3L",
                content: `
                    <div class="space-y-4 p-4 text-sm">
                        <h4 class="text-lg font-bold text-indigo-700 flex items-center mb-2"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a4 4 0 014-4h.5a4 4 0 014 4v1m0 0h12a4 4 0 004-4v-1a4 4 0 00-4-4h-3"></path></svg> Key Arrangement Types</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>**Linear:** Left/Right depends on whether the people are facing North or South.</li>
                            <li>**Circular (Facing Center):** Left is Clockwise, Right is Counter-Clockwise.</li>
                            <li>**Circular (Facing Outside):** Left is Counter-Clockwise, Right is Clockwise.</li>
                        </ul>
                        <h4 class="text-lg font-bold text-gray-700 flex items-center mt-3 pt-2 border-t border-gray-200"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Solving Strategy</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>Start with definite information (A is sitting next to B).</li>
                            <li>Use negative statements (C is NOT sitting next to D) to eliminate possibilities.</li>
                        </ul>
                    </div>
                `
            }
        ],
    },
    Technical: {
        title: "Technical Concepts (CS Fundamentals)",
        sections: [
            {
                subtopic: "Data Structures and Algorithms",
                icon: Layers,
                youtube: "https://youtu.be/4_HOnhB64Dg?si=6SpvYNPhZ9SNgkmD",
                content: `
                    <div class="space-y-4 p-4 text-sm">
                        <h4 class="text-lg font-bold text-indigo-700 flex items-center mb-2"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg> Key Data Structures</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>**Stack (LIFO):** Last-In, First-Out. Uses: function calls, expression evaluation.</li>
                            <li>**Queue (FIFO):** First-In, First-Out. Uses: task scheduling, breadth-first search.</li>
                            <li>**Arrays:** $O(1)$ access, but $O(n)$ insertion/deletion (requires shifting).</li>
                            <li>**Linked Lists:** $O(n)$ access, but $O(1)$ insertion/deletion at endpoints.</li>
                        </ul>
                        <h4 class="text-lg font-bold text-gray-700 flex items-center mt-3 pt-2 border-t border-gray-200"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Trees & Graphs</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>**BST (Binary Search Tree):** $O(\\log n)$ average search/insert time, but $O(n)$ worst case (skewed tree).</li>
                        </ul>
                    </div>
                `
            },
            {
                subtopic: "Time and Space Complexity",
                icon: Clock,
                youtube: "https://youtu.be/FPu9Uld7W-E?si=08suUld7W-E",
                content: `
                    <div class="space-y-4 p-4 text-sm">
                        <h4 class="text-lg font-bold text-indigo-700 flex items-center mb-2"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c1.657 0 3 .895 3 2s-1.343 2-3 2-3 .895-3 2 1.343 2 3 2m0-8V3"></path></svg> Big O Fundamentals</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>**Time Complexity:** Measures the growth rate of execution time relative to input size ($n$).</li>
                            <li>**Space Complexity:** Measures the growth rate of memory usage relative to $n$.</li>
                            <li>**Order (Best to Worst):** $O(1) < O(\\log n) < O(n) < O(n \\log n) < O(n^2)$.</li>
                        </ul>
                        <h4 class="text-lg font-bold text-gray-700 flex items-center mt-3 pt-2 border-t border-gray-200"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 4.016A11.955 11.955 0 0012 21.056c3.178 0 6.168-1.037 8.618-2.944z"></path></svg> Common Examples</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>$O(1)$: Accessing an array element by index.</li>
                            <li>$O(\\log n)$: Binary Search.</li>
                            <li>$O(n \\log n)$: Efficient sorting algorithms (Merge Sort, Heap Sort).</li>
                        </ul>
                    </div>
                `
            },
            {
                subtopic: "SQL and Database Concepts",
                icon: Database,
                youtube: "https://youtu.be/Iceaqdy7mEs?si=FfuBdYv_P-MdkjGI",
                content: `
                    <div class="space-y-4 p-4 text-sm">
                        <h4 class="text-lg font-bold text-indigo-700 flex items-center mb-2"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5-6h7a2 2 0 012 2v6a2 2 0 01-2 2h-7a2 2 0 01-2-2V7a2 2 0 012-2z"></path></svg> Core Command Categories</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>**DML (Data Manipulation):** <span class="font-mono text-xs bg-gray-200 p-0.5 rounded">SELECT</span>, <span class="font-mono text-xs bg-gray-200 p-0.5 rounded">INSERT</span>, <span class="font-mono text-xs bg-gray-200 p-0.5 rounded">UPDATE</span>, <span class="font-mono text-xs bg-gray-200 p-0.5 rounded">DELETE</span>. (Handles data within tables).</li>
                            <li>**DDL (Data Definition):** <span class="font-mono text-xs bg-gray-200 p-0.5 rounded">CREATE</span>, <span class="font-mono text-xs bg-gray-200 p-0.5 rounded">ALTER</span>, <span class="font-mono text-xs bg-gray-200 p-0.5 rounded">DROP</span>, <span class="font-mono text-xs bg-gray-200 p-0.5 rounded">TRUNCATE</span>. (Handles table structure).</li>
                        </ul>
                        <h4 class="text-lg font-bold text-gray-700 flex items-center mt-3 pt-2 border-t border-gray-200"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 4.016A11.955 11.955 0 0012 21.056c3.178 0 6.168-1.037 8.618-2.944z"></path></svg> Transactions</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li><span class="font-mono text-xs bg-gray-200 p-0.5 rounded">COMMIT</span>: Permanently saves transaction changes.</li>
                            <li><span class="font-mono text-xs bg-gray-200 p-0.5 rounded">ROLLBACK</span>: Undoes changes since the last COMMIT.</li>
                        </ul>
                    </div>
                `
            },
            {
                subtopic: "Object-Oriented Programming (OOP)",
                icon: Cpu,
                youtube: "https://youtu.be/dpUWV0EY5PI?si=L1-q3zyd7GcqmhRw",
                content: `
                    <div class="space-y-4 p-4 text-sm">
                        <h4 class="text-lg font-bold text-indigo-700 flex items-center mb-2"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-3m0 0l-4-4m4 4H3"></path></svg> The Four Pillars</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>**Encapsulation:** Bundling data and methods together (data hiding).</li>
                            <li>**Abstraction:** Hiding complex implementation details and showing only essential features.</li>
                            <li>**Inheritance (Is-A):** Extending properties/methods from a parent class.</li>
                            <li>**Polymorphism:** An object's ability to take on multiple forms (method overriding/overloading).</li>
                        </ul>
                        <h4 class="text-lg font-bold text-gray-700 flex items-center mt-3 pt-2 border-t border-gray-200"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 4.016A11.955 11.955 0 0012 21.056c3.178 0 6.168-1.037 8.618-2.944z"></path></svg> Relationships</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>**Association (Has-A):** One class uses or contains an object of another class.</li>
                        </ul>
                    </div>
                `
            },
            {
                subtopic: "Networking and Protocols",
                icon: Network,
                youtube: "https://youtu.be/aUYwx9bYlGY?si=HA7KmDOhS2hrgGFl",
                content: `
                    <div class="space-y-4 p-4 text-sm">
                        <h4 class="text-lg font-bold text-indigo-700 flex items-center mb-2"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg> OSI Model (Key Layers)</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>**Layer 7 (Application):** HTTP, DNS (Provides user services).</li>
                            <li>**Layer 4 (Transport):** TCP (Reliable connection), UDP (Fast, connectionless).</li>
                            <li>**Layer 3 (Network):** IP (Logical addressing), Routers (Path selection).</li>
                            <li>**Layer 2 (Data Link):** MAC Addresses, Switches (Frame forwarding).</li>
                        </ul>
                        <h4 class="text-lg font-bold text-gray-700 flex items-center mt-3 pt-2 border-t border-gray-200"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 4.016A11.955 11.955 0 0012 21.056c3.178 0 6.168-1.037 8.618-2.944z"></path></svg> Addressing</h4>
                        <ul class="list-disc space-y-1 ml-6">
                            <li>**ARP (Address Resolution Protocol):** Maps IP $\\rightarrow$ MAC address.</li>
                            <li>**DNS (Domain Name System):** Maps Domain Name $\\rightarrow$ IP address.</li>
                        </ul>
                    </div>
                `
            }
        ],
    }
};

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
    const baseStyle = "py-3 px-6 rounded-lg font-semibold transition duration-200 shadow-xl";
    const primaryStyle = "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-2xl transform hover:-translate-y-0.5";
    const secondaryStyle = "bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 shadow-md";
    const disabledStyle = "opacity-50 cursor-not-allowed shadow-none transform-none";

    return (
        <button
            onClick={onClick}
            className={`${baseStyle} ${variant === 'primary' ? primaryStyle : secondaryStyle} ${className} ${disabled ? disabledStyle : ''}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

const QuizQuestion = ({ question, index, totalQuestions, onAnswer, timerValue }) => {
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isConfirmed, setIsConfirmed] = useState(false);

    const handleConfirmAnswer = () => {
        if (selectedAnswer && !isConfirmed) {
            setIsConfirmed(true);
            onAnswer(selectedAnswer);
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-2xl border border-indigo-100">
            <div className="mb-6 flex justify-between items-center border-b pb-4">
                <h3 className="text-lg font-semibold text-indigo-600">
                    Question {index + 1} of {totalQuestions}
                </h3>
                <div className="flex items-center text-xl font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full shadow-inner">
                    <Clock className="w-5 h-5 mr-2" />
                    {Math.floor(timerValue / 60).toString().padStart(2, '0')}:{(timerValue % 60).toString().padStart(2, '0')}
                </div>
            </div>

            <p className="text-xl font-bold text-gray-800 mb-6">{question.q}</p>

            <div className="space-y-4">
                {question.a.map((answer, i) => {
                    const isSelected = answer === selectedAnswer;

                    let answerStyle = "bg-gray-50 hover:bg-indigo-50 border-gray-300";
                    
                    if (isSelected) {
                        answerStyle = "bg-indigo-100 border-indigo-500 text-indigo-800 font-semibold shadow-md";
                    }

                    return (
                        <div
                            key={i}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition duration-200 flex items-center ${answerStyle} ${isConfirmed ? 'opacity-70 cursor-not-allowed' : ''}`}
                            onClick={() => {
                                if (!isConfirmed) {
                                    setSelectedAnswer(answer);
                                }
                            }}
                        >
                            <input
                                type="radio"
                                name="answer"
                                checked={isSelected}
                                readOnly
                                className="w-5 h-5 mr-3 accent-indigo-600"
                            />
                            <span className="flex-1">
                                {answer}
                            </span>
                        </div>
                    );
                })}
            </div>

            <Button
                onClick={handleConfirmAnswer}
                variant="primary"
                className="w-full mt-8"
                disabled={!selectedAnswer || isConfirmed}
            >
                {isConfirmed ? 'Answer Locked' : 'Confirm Answer'}
            </Button>
        </div>
    );
};

const StartScreen = ({ onStartQuiz, onNavigate }) => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
  <div className="w-full max-w-5xl border-4 border-indigo-300 rounded-2xl shadow-lg p-6 text-center">
    <h2 className="text-4xl font-extrabold text-black mb-4">
      Welcome to Trivium
    </h2>
    <p className="text-xl text-gray-700 mb-10">
      Test your knowledge across core professional domains.
    </p>

    {/* Quiz Categories */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {['Aptitude', 'Logical', 'Technical'].map(category => (
        <div
          key={category}
          className="p-6 border-2 border-indigo-200 rounded-xl cursor-pointer hover:shadow-2xl transition duration-300 transform hover:scale-[1.05] bg-indigo-50 hover:bg-indigo-100"
          onClick={() => onStartQuiz(category)}
        >
          <div className="text-indigo-600 mb-2">
            {category === 'Aptitude' ? (
              <Gauge className="w-8 h-8 mx-auto" />
            ) : category === 'Logical' ? (
              <Cpu className="w-8 h-8 mx-auto" />
            ) : (
              <Code className="w-8 h-8 mx-auto" />
            )}
          </div>
          <h3 className="text-xl font-bold text-indigo-700">{category}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {QUESTIONS[category].length} Questions
          </p>
        </div>
      ))}
    </div>

    {/* Action Buttons */}
    <div className="flex flex-col sm:flex-row justify-center gap-4">
      <Button
        onClick={() => onNavigate('learn_screen')}
        variant="secondary"
        className="w-full sm:w-auto max-w-sm"
      >
        <BookOpen className="w-5 h-5 mr-2" /> View Study Material
      </Button>
      <Button
        onClick={() => onNavigate('about_screen')}
        variant="secondary"
        className="w-full sm:w-auto max-w-sm"
      >
        <Info className="w-5 h-5 mr-2" /> About App
      </Button>
      <Button
        onClick={() => onNavigate('leaderboard_screen')}
        variant="secondary"
        className="w-full sm:w-auto max-w-sm"
      >
        View Global Leaderboard
      </Button>
      <Button
        onClick={() => onNavigate('feedback_screen')}
        variant="secondary"
        className="w-full sm:w-auto max-w-sm"
      >
        Send Feedback
      </Button>
    </div>
  </div>
</section>
  );
};


const CollapsibleSection = ({ subtopic, icon: Icon, content, youtube }) => {
    const [isOpen, setIsOpen] = useState(false);

    const IconTag = Icon;

    return (
        <div className="border border-indigo-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition duration-200">
            {/* Header */}
            <div
                className="flex justify-between items-center p-4 cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition duration-150"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center text-xl font-bold text-indigo-800">
                    <IconTag className="w-6 h-6 mr-3 text-indigo-600" />
                    {subtopic}
                </div>
                {isOpen ? <ChevronUp className="w-6 h-6 text-indigo-500" /> : <ChevronDown className="w-6 h-6 text-indigo-500" />}
            </div>

            {/* Content */}
            {isOpen && (
                <div className="p-4 bg-white border-t border-indigo-200">
                    {/* Render professional content using dangerouslySetInnerHTML */}
                    <div
                        className="text-gray-700 text-sm leading-relaxed study-content"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                    <a
                        href={youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center text-white bg-red-600 hover:bg-red-700 py-2 px-4 rounded-lg font-semibold transition duration-150 shadow-lg text-sm"
                    >
                        <Play className="w-4 h-4 mr-2" />
                        Watch Tutorial
                    </a>
                </div>
            )}
        </div>
    );
};

const LearnScreen = ({ onNavigate }) => {
    const [selectedCategory, setSelectedCategory] = useState('Aptitude');
    const material = STUDY_MATERIAL[selectedCategory];

    return (
        <div className="py-10 max-w-3xl mx-auto">
            <button onClick={() => onNavigate('start_screen')} className="text-black-600 hover:text-red-800 font-bold mb-6 flex items-center transition duration-150">
                &larr; Back to Start
            </button>
            <h2 className="text-4xl font-extrabold text--800 mb-8 flex items-center border-b pb-4">
                <BookOpen className="w-8 h-8 mr-3" />
                Trivium Learning Center
            </h2>

            {/* Category Tabs */}
            <div className="flex space-x-2 mb-8 p-1 bg-gray-100 rounded-lg shadow-inner">
                {['Aptitude', 'Logical', 'Technical'].map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`py-2 px-4 rounded-lg font-semibold transition duration-200 flex-1 ${selectedCategory === category
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <h3 className="text-2xl font-bold text-gray-700 mb-6">{material.title}</h3>

            {/* Collapsible Sections */}
            <div className="space-y-4">
                {material.sections.map((section, index) => (
                    <CollapsibleSection
                        key={index}
                        {...section}
                    />
                ))}
            </div>
        </div>
    );
};

const AboutScreen = ({ onNavigate }) => (
    <div className="py-10 max-w-3xl mx-auto">
        <button onClick={() => onNavigate('start_screen')} className="text-black-600 hover:text-red-800 font-bold mb-6 flex items-center transition duration-150">
            &larr; Back to Start
        </button>
        <h2 className="text-4xl font-extrabold text--800 mb-8 flex items-center border-b pb-4">
            <Info className="w-8 h-8 mr-3" />
            About Trivium: A Quiz Platform
        </h2>

        <div className="bg-white p-8 rounded-2xl shadow-2xl border border-indigo-100 space-y-8 text-gray-700">
            
            {/* Developer Spotlight Section - Enhanced Styling */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-xl shadow-2xl text-white transform hover:scale-[1.01] transition duration-300">
                <h3 className="text-3xl font-extrabold mb-1 flex items-center">
                    <Award className="w-8 h-8 mr-3 text-yellow-300" /> The Developer
                </h3>
                <p className="text-lg font-medium border-t border-white/30 pt-2 mt-2">
                    Conceptualized and developed by EDWIN ADAMS V as a solution for rigorous, focused test preparation. This platform is a testament to dedicated software craftsmanship.
                </p>
            </div>

            {/* Key Features Section */}
            <h3 className="text-2xl font-bold text-gray-800 border-b pb-2">Key Application Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border border-indigo-200 rounded-lg shadow-sm">
                    <Clock className="w-6 h-6 text-indigo-600 mb-2" />
                    <h4 className="font-bold text-lg">Time-Based Scoring</h4>
                    <p className="text-sm">Points are calculated based on accuracy AND time taken (100 points - seconds elapsed), heavily rewarding speed and precision.</p>
                </div>
                <div className="p-4 border border-indigo-200 rounded-lg shadow-sm">
                    <Layers className="w-6 h-6 text-indigo-600 mb-2" />
                    <h4 className="font-bold text-lg">Structured Learning</h4>
                    <p className="text-sm">Collapsible study material with clear concept outlines and direct links to high-quality external tutorials.</p>
                </div>
                <div className="p-4 border border-indigo-200 rounded-lg shadow-sm">
                    <ClipboardList className="w-6 h-6 text-indigo-600 mb-2" />
                    <h4 className="font-bold text-lg">Detailed Post-Quiz Review</h4>
                    <p className="text-sm">Answers and correct solutions are only revealed at the end of the 15-minute quiz, securing the testing environment.</p>
                </div>
                <div className="p-4 border border-indigo-200 rounded-lg shadow-sm">
                    <Gauge className="w-6 h-6 text-indigo-600 mb-2" />
                    <h4 className="font-bold text-lg">Three Core Domains</h4>
                    <p className="text-sm">Focused question sets in **Aptitude**, **Logical Reasoning**, and **Technical** skills.</p>
                </div>
            </div>

            {/* Technology Stack Section */}
            <h3 className="text-2xl font-bold text-gray-800 border-b pb-2 pt-4">Technology & Architecture</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 border rounded-lg">
                    <h4 className="font-bold text-lg text-indigo-700 flex items-center"><Code className="w-5 h-5 mr-1" /> Frontend Stack</h4>
                    <ul className="list-disc space-y-1 ml-5 text-sm mt-1">
                        <li>**React:** For the responsive, component-based user interface.</li>
                        <li>**Tailwind CSS:** Used for all styling, ensuring a fast, mobile-first design.</li>
                        <li>**Lucide Icons:** Provides clean, functional icons for visual clarity.</li>
                    </ul>
                </div>
                <div className="p-4 bg-gray-50 border rounded-lg">
                    <h4 className="font-bold text-lg text-indigo-700 flex items-center"><Database className="w-5 h-5 mr-1" /> Backend Readiness</h4>
                    <p className="text-sm mt-1">
                        The score tracking and global leaderboard functionality is currently disabled but is architecturally ready for immediate integration with a dedicated **Firebase/Firestore** backend upon project deployment.
                    </p>
                </div>
            </div>
        </div>
    </div>
);

const FinalReviewSection = ({ results }) => {
    return (
        <div className="mt-8 p-6 bg-white rounded-2xl shadow-2xl border border-indigo-100">
            <h3 className="text-3xl font-bold text-indigo-800 mb-6 border-b pb-3 flex items-center">
                <ClipboardList className="w-6 h-6 mr-2" /> Detailed Review
            </h3>
            
            <div className="space-y-6">
                {results.map((result, index) => {
                    const isCorrect = result.userAnswer === result.question.correct;
                    const resultStyle = isCorrect ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50';

                    return (
                        <div key={index} className={`p-4 border-l-4 rounded-lg shadow-sm ${resultStyle}`}>
                            <p className="text-sm text-gray-500 font-medium">Question {index + 1}</p>
                            <p className="text-lg font-semibold text-gray-800 mb-2">{result.question.q}</p>
                            
                            <div className="space-y-1 text-sm">
                                <p className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                    {isCorrect ? <CheckCircle className="w-4 h-4 inline mr-1" /> : <XCircle className="w-4 h-4 inline mr-1" />}
                                    Your Answer: <span className="font-bold">{result.userAnswer || "N/A"}</span>
                                </p>
                                {!isCorrect && (
                                    <p className="text-gray-700 font-semibold">
                                        Correct Answer: <span className="font-bold text-green-700">{result.question.correct}</span>
                                    </p>
                                )}
                            </div>
                            <p className="text-xs text-gray-600 mt-2">Points Earned: {result.pointsEarned}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
const FeedbackScreen = ({ onNavigate }) => {
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const response = await fetch("https://formspree.io/f/mblqavvv", {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json"
      }
    });

    if (response.ok) {
      onNavigate("thankyou_screen");
    } else {
      alert("Something went wrong. Try again later.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">

      <h1 className="text-4xl font-extrabold text-center mb-6 
          bg-gradient-to-r from-orange-500 to-orange-600 
          text-transparent bg-clip-text">
         We Value Your Feedback
      </h1>

      <form 
        onSubmit={handleFeedbackSubmit}
        className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200"
      >
        
        <label className="block mb-4">
          <span className="text-gray-700 font-semibold">Your Name</span>
          <input
            type="text"
            name="name"
            required
            className="mt-2 w-full p-3 border rounded-lg shadow-sm"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700 font-semibold">Email</span>
          <input
            type="email"
            name="email"
            className="mt-2 w-full p-3 border rounded-lg shadow-sm"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700 font-semibold">Your Feedback</span>
          <textarea
            name="message"
            rows="5"
            required
            className="mt-2 w-full p-3 border rounded-lg shadow-sm"
          ></textarea>
        </label>

        <button
          type="submit"
          className="w-full py-3 rounded-lg font-bold text-white 
            bg-gradient-to-r from-indigo-600 to-purple-600 
            hover:from-indigo-700 hover:to-purple-700 
            transition-all shadow-lg"
        >
           Submit Feedback
        </button>
      </form>

      <div className="mt-6 text-center">
        <button onClick={() => onNavigate('start_screen')} className="text--600 hover:text-red-800 font-bold mb-6 flex items-center transition duration-150"> &larr; Back to Start </button>
      </div>
    </div>
  );
};

const ThankYouScreen = ({ onNavigate }) => {
  return (
    <div className="max-w-xl mx-auto text-center p-10">
      <h1 className="text-4xl font-extrabold mb-4 text-green-600">
        🎉 Thank You!
      </h1>

      <p className="text-gray-600 text-lg mb-8">
        Your feedback has been successfully submitted.  
        We appreciate your time and support! 💙
      </p>

      <button
        onClick={() => onNavigate('start_screen')}
        className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold 
          hover:bg-indigo-700 transition shadow-lg"
      >
        ⬅ Go Back to Home
      </button>
    </div>
  );
};

const App = () => {
    const categoryMap = {
  aptitude: "aptitude",
  logical: "logical",
  technical: "technical",

  Aptitude: "aptitude",
  Logical: "logical",
  Technical: "technical",

  LR: "logical",
  reasoning: "logical",

  tech: "technical",
  mcq: "technical"
};

    const [gameState, setGameState] = useState('start_screen'); 
    const [currentCategory, setCurrentCategory] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [quizStartTime, setQuizStartTime] = useState(0);
    const [questionStartTime, setQuestionStartTime] = useState(0);
    const [timeLeft, setTimeLeft] = useState(TOTAL_QUIZ_TIME_SECONDS);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [quizResults, setQuizResults] = useState([]);
    const [copyStatus, setCopyStatus] = useState('');
    const [leaderboard, setLeaderboard] = useState([]);
    const [selectedLeaderboardCategory, setSelectedLeaderboardCategory] = useState('aptitude'); // default


    const timerRef = useRef(null);

    const saveToLeaderboard = async (username, score, category) => {
  if (!category) {
    console.error("❌ ERROR: category is undefined");
    return;
  }

  console.log("🔥 Saving score:", {
    username,
    score,
    category,
    collection: `leaderboard_${category}`
  });

  try {
    const colName = `leaderboard_${category}`;
    await addDoc(collection(db, colName), {
      username,
      score,
      category,
      timestamp: new Date()
    });

    console.log("✅ Saved successfully:", colName);

  } catch (error) {
    console.error("❌ Firestore save error:", error);
  }
};
    const loadLeaderboard = async (category) => {
  try {
    const colName = `leaderboard_${category}`;
    const leaderboardRef = collection(db, colName);
    const q = query(leaderboardRef, orderBy("score", "desc"), limit(10));

    const snapshot = await getDocs(q);

    const data = snapshot.docs.map(doc => doc.data());

    console.log("📥 Loaded leaderboard:", data);

    setLeaderboard(data);

  } catch (error) {
    console.error("❌ ERROR loading leaderboard:", error);
    setLeaderboard([]);
  }
};
    useEffect(() => {
        if (gameState === 'quiz_in_progress') {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setGameState('results_screen');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }

        return () => clearInterval(timerRef.current);
    }, [gameState]);


    useEffect(() => {
        if (gameState === 'quiz_in_progress' && timeLeft === 0) {
            setGameState('results_screen');
        }
    }, [timeLeft, gameState]);

    useEffect(() => {
  if (gameState === "leaderboard_screen") {
    loadLeaderboard(selectedLeaderboardCategory);
  }
}, [gameState, selectedLeaderboardCategory]);

    const handleNavigate = (state) => {
        setGameState(state);
        setCopyStatus('');
    };

    const handleStartQuiz = (category) => {
        const shuffled = QUESTIONS[category].sort(() => Math.random() - 0.5);
        setCurrentCategory(category);
        setQuestions(shuffled);
        setCurrentQuestionIndex(0);
        setScore(0);
        setQuizResults([]);
        setTimeLeft(TOTAL_QUIZ_TIME_SECONDS);
        setQuizStartTime(Date.now());
        setQuestionStartTime(Date.now());
        setIsTransitioning(false);
        setGameState('quiz_in_progress');
        setCopyStatus('');
    };

const handleAnswer = (userAnswer) => {
    if (isTransitioning) return;

    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
    setIsTransitioning(true);

    const currentQ = questions[currentQuestionIndex];
    const isCorrect = userAnswer === currentQ.correct;

    let pointsEarned = 0;
    if (isCorrect) {
        pointsEarned = Math.max(
            0,
            BASE_POINTS_PER_QUESTION - Math.min(timeTaken, BASE_POINTS_PER_QUESTION)
        );
        setScore(prev => prev + pointsEarned);
    }

    setQuizResults(prev => [...prev, {
        question: currentQ,
        userAnswer,
        pointsEarned
    }]);

    setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setQuestionStartTime(Date.now());
        } else {

            clearInterval(timerRef.current);
            setGameState('results_screen');

            const playerName = prompt("Enter your name:");
            if (!playerName) return;

            const normalizedCategory = categoryMap[currentCategory.toLowerCase()];

            console.log("Saving to:", normalizedCategory);

            saveToLeaderboard(playerName, score, normalizedCategory);
        }

        setIsTransitioning(false);
    }, 1000);
};  
    const handleCopySummary = async () => {
        const quizDuration = Math.floor((Date.now() - quizStartTime) / 1000);

        const summaryText = `
        🚀 TRIVIUM QUIZ RESULT 🚀
        Category: ${currentCategory}
        Final Score: ${score} points
        Accuracy: ${quizResults.filter(r => r.userAnswer === r.question.correct).length}/${questions.length} correct
        Time Taken: ${Math.floor(quizDuration / 60)}m ${quizDuration % 60}s
        
        Developed by Edwin Adams. Think you can beat my score? #Trivium #EdwinAdams
        `.trim();

        const modalMessage = document.getElementById('manual-copy-message');
        if (modalMessage) {
            modalMessage.innerHTML = '';
            modalMessage.classList.add('hidden');
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            setCopyStatus('Copying...');
            try {
                await navigator.clipboard.writeText(summaryText);
                setCopyStatus('Copied to clipboard!');
                setTimeout(() => setCopyStatus(''), 3000);
                return;
            } catch (err) {
                console.error('Modern clipboard API failed. Falling back.', err);
            }
        }
        
        const textArea = document.createElement("textarea");
        textArea.value = summaryText;
        textArea.style.position = 'fixed'; 
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        let success = false;
        try {
            success = document.execCommand('copy');
        } catch (err) {
            console.error('Legacy copy command failed:', err);
        }
        document.body.removeChild(textArea);

        if (success) {
            setCopyStatus('Copied to clipboard! (Legacy)');
        } else {
            setCopyStatus('Failed to copy. Please press Ctrl+C or Cmd+C to copy.');

            const manualArea = document.createElement("textarea");
            manualArea.value = summaryText;
            manualArea.rows = 5;
            manualArea.cols = 50;
            manualArea.style.width = '100%';
            manualArea.style.marginTop = '10px';
            manualArea.readOnly = true;
            manualArea.className = 'p-2 border rounded-lg resize-none text-sm font-mono';

            if (modalMessage) {
                modalMessage.classList.remove('hidden');

                const instructions = document.createElement('p');
                instructions.className = 'text-sm font-semibold text-red-600 mb-2';
                instructions.textContent = 'Automatic copy failed. Please select the text below and press Ctrl+C (Cmd+C).';
                
                modalMessage.appendChild(instructions);
                modalMessage.appendChild(manualArea);
                manualArea.select(); 
            }
        }
        
        setTimeout(() => setCopyStatus(''), 5000);
    };


    const renderContent = () => {
        switch (gameState) {
            case 'thankyou_screen':
                return <ThankYouScreen onNavigate={handleNavigate} />;

            case 'feedback_screen':
                return <FeedbackScreen onNavigate={handleNavigate} />;

            case 'start_screen':
                return <StartScreen onStartQuiz={handleStartQuiz} onNavigate={handleNavigate} />;

            case 'learn_screen':
                return <LearnScreen onNavigate={handleNavigate} />;
                
            case 'about_screen':
                return <AboutScreen onNavigate={handleNavigate} />;

            case 'quiz_in_progress':
                return (
                    <div className="max-w-xl mx-auto py-10">
                        <QuizQuestion
                            key={currentQuestionIndex} 
                            question={questions[currentQuestionIndex]}
                            index={currentQuestionIndex}
                            totalQuestions={questions.length}
                            onAnswer={handleAnswer}
                            timerValue={timeLeft}
                        />
                    </div>
                );

            case 'results_screen':
                const quizDuration = Math.floor((Date.now() - quizStartTime) / 1000);

                return (
                    <div className="max-w-xl mx-auto py-10">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl border border-indigo-100 text-center mb-8">
                            <h2 className="text-4xl font-extrabold text-indigo-800 mb-4">Quiz Finished!</h2>
                            <p className="text-xl text-gray-600 mb-6">Your Performance in **{currentCategory}**</p>
                            <div className="flex justify-around items-center mb-8">
                                <div className="p-4 bg-green-100 rounded-xl">
                                    <p className="text-sm text-green-700 font-semibold">Final Score</p>
                                    <p className="text-5xl font-extrabold text-green-600">{score}</p>
                                </div>
                                <div className="p-4 bg-blue-100 rounded-xl">
                                    <p className="text-sm text-blue-700 font-semibold">Time Spent</p>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {Math.floor(quizDuration / 60)}m {quizDuration % 60}s
                                    </p>
                                </div>
                            </div>
                            
                            {/* Copy Status Feedback */}
                            {copyStatus && (
                                <p className={`mt-4 text-sm font-semibold ${copyStatus.startsWith('Copied') ? 'text-green-600' : copyStatus.startsWith('Copying') ? 'text-indigo-600' : 'text-red-600'}`}>
                                    {copyStatus}
                                </p>
                            )}
                            
                            {/* Manual Copy Area Mount Point */}
                            <div id="manual-copy-message" className="mt-4 p-4 border border-red-200 bg-red-50 rounded-lg text-left hidden">
                                {/* This is where the manual copy textarea will be mounted if copy fails */}
                            </div>


                            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:space-x-4 justify-center mt-6">
                                <Button onClick={handleCopySummary} variant="primary" className="sm:w-auto w-full">
                                    <ClipboardList className="w-5 h-5 mr-2" /> Copy Score Summary
                                </Button>
                                <Button onClick={() => handleNavigate('start_screen')} variant="secondary" className="sm:w-auto w-full">
                                    <RefreshCw className="w-5 h-5 mr-2" /> Try Another Quiz
                                </Button>
                                <Button onClick={() => setGameState("leaderboard_screen")} variant="secondary" className="sm:w-auto w-full">
                                     View Global Leaderboard
                                </Button>
                                <Button onClick={() => handleNavigate('feedback_screen')} variant="secondary">
                                     Send Feedback
                                </Button>

                            </div>
                        </div>
                        
                        {/* New Review Section */}
                        <FinalReviewSection results={quizResults} />
                    </div>
                );
            case 'leaderboard_screen':
    return (
        <div className="w-full max-w-3xl mx-auto p-6">
            <h1 className="text-4xl font-extrabold text-center mb-10 
                bg-gradient-to-r from-black to-black 
                text-transparent bg-clip-text">
                 Global Leaderboard
            </h1>
            <div className="flex justify-center mb-8">
  <select
    value={selectedLeaderboardCategory}
    onChange={(e) => setSelectedLeaderboardCategory(e.target.value)}
    className="
      px-5 py-3 
      bg-white 
      border border-gray-300 
      rounded-lg 
      text-gray-800 
      shadow-sm 
      cursor-pointer 
      transition-all 
      duration-200
      text-base

      hover:bg-gradient-to-r 
      hover:from-indigo-50 
      hover:to-purple-50 

      focus:outline-none 
      focus:ring-2 
      focus:ring-indigo-500 
      focus:border-indigo-500
    "
  >
    <option value="aptitude">Aptitude</option>
    <option value="logical">Logical Reasoning</option>
    <option value="technical">Technical MCQ</option>
  </select>
</div>


            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                
                {leaderboard.length === 0 ? (
                    <p className="text-center text-gray-500 py-6">Loading leaderboard...</p>
                ) : (
                    <ul className="divide-y divide-gray-100">

                        {leaderboard.map((entry, index) => (
                            <li 
                                key={index}
                                className={`flex items-center justify-between py-4 px-2 transition 
                                    ${index === 0 ? "bg-yellow-50" : ""} 
                                    ${index === 1 ? "bg-gray-50" : ""} 
                                    ${index === 2 ? "bg-orange-50" : ""}`}
                            >

                                {/* Left side */}
                                <div className="flex items-center gap-4">

                                    {/* Rank Number */}
                                    <span className="text-2xl font-bold text-indigo-600">
                                        {index + 1}
                                    </span>

                                    {/* Avatar Bubble */}
                                    <div className="w-12 h-12 flex items-center justify-center 
                                        rounded-full bg-indigo-100 text-indigo-700 font-bold text-xl shadow">
                                        {entry.username[0].toUpperCase()}
                                    </div>

                                    {/* Username */}
                                    <span className="text-lg font-semibold text-gray-800">
                                        {entry.username}
                                    </span>
                                </div>

                                {/* Score */}
                                <span className="text-xl font-bold text-green-600">
                                    {entry.score}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="mt-8 text-center">
                <button onClick={() => handleNavigate('start_screen')} className="text--600 hover:text-red-800 font-bold mb-6 flex items-center transition duration-150"> &larr; Back to Start </button>
            </div>
        </div>
    );

            default:
                return <StartScreen onStartQuiz={handleStartQuiz} onNavigate={handleNavigate} />;
        }
    };

    return (
       <div className="min-h-screen font-sans relative overflow-hidden animated-bg">
        {/* FLOATING PARTICLES */}
<div className="particles-container">
  {Array.from({ length: 30 }).map((_, i) => (
    <div
      key={i}
      className="particle"
      style={{
        left: `${Math.random() * 100}%`,
        '--i': i,
        animationDuration: `${6 + Math.random() * 6}s`,
        animationDelay: `${-Math.random() * 10}s`
      }}
    />
  ))}
</div>


            <div className="pointer-events-none fixed inset-0 overflow-hidden">
  <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-indigo-300 opacity-20 blur-3xl rounded-full"></div>
  <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] bg-purple-300 opacity-20 blur-3xl rounded-full"></div>
</div>

            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-extrabold text-indigo-700">Trivium</h1>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div className="min-h-[80vh]">
        {renderContent()}
    </div>
</main>

        </div>
    );
};

export default App;
