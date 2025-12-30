import json
import sys

def validate_quiz(filename):
    """Validate quiz JSON file and check for issues"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if not isinstance(data, list):
            print(f"❌ Error: Root should be an array, got {type(data)}")
            return False
        
        print(f"✓ Valid JSON with {len(data)} questions")
        
        issues = []
        for i, q in enumerate(data, 1):
            # Check required fields
            if 'question' not in q:
                issues.append(f"Question {i}: Missing 'question' field")
            if 'answers' not in q:
                issues.append(f"Question {i}: Missing 'answers' field")
            if 'correct_answer' not in q:
                issues.append(f"Question {i}: Missing 'correct_answer' field")
                continue
            
            # Check answers array
            if not isinstance(q.get('answers'), list):
                issues.append(f"Question {i}: 'answers' should be an array")
            elif len(q['answers']) == 0:
                issues.append(f"Question {i}: 'answers' array is empty")
            
            # Check correct_answer is valid
            correct = q.get('correct_answer')
            answers_count = len(q.get('answers', []))
            if not isinstance(correct, int):
                issues.append(f"Question {i}: 'correct_answer' should be a number, got {type(correct)}")
            elif correct < 0 or correct >= answers_count:
                issues.append(f"Question {i}: 'correct_answer' ({correct}) out of range (0-{answers_count-1})")
        
        if issues:
            print(f"\n❌ Found {len(issues)} issues:")
            for issue in issues:
                print(f"  - {issue}")
            return False
        else:
            print("✓ All questions are valid!")
            return True
            
    except json.JSONDecodeError as e:
        print(f"❌ JSON Parse Error: {e}")
        return False
    except FileNotFoundError:
        print(f"❌ File not found: {filename}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    filename = sys.argv[1] if len(sys.argv) > 1 else "sns_lab2.json"
    validate_quiz(filename)