import json
import random
from pathlib import Path
from typing import List, Tuple

# Common patterns in phishing emails
PHISHING_PATTERNS = {
    "urgency": [
        "Immediate action required",
        "Your account will be suspended",
        "Security alert: Unauthorized access",
        "Payment overdue",
        "Limited time offer",
    ],
    "greetings": [
        "Dear valued customer",
        "Dear account holder",
        "Dear user",
        "Attention",
        "Important notice",
    ],
    "hooks": [
        "Verify your account",
        "Update your payment information",
        "Confirm your identity",
        "Claim your reward",
        "Reset your password",
    ],
    "threats": [
        "Account access will be restricted",
        "Your account shows suspicious activity",
        "Your account will be terminated",
        "Legal action may be taken",
        "Service will be discontinued",
    ],
    "calls_to_action": [
        "Click here to verify",
        "Login now",
        "Update immediately",
        "Click the secure link below",
        "Download attachment to verify",
    ],
}

# Common patterns in legitimate emails
LEGITIMATE_PATTERNS = {
    "greetings": [
        "Hi {name}",
        "Hello {name}",
        "Good morning",
        "Dear {name}",
        "Greetings",
    ],
    "business_topics": [
        "Weekly team update",
        "Meeting summary",
        "Project status",
        "New feature announcement",
        "Company newsletter",
    ],
    "closings": [
        "Best regards",
        "Thanks",
        "Sincerely",
        "Regards",
        "Cheers",
    ],
}

# Common names for synthetic data
NAMES = [
    "John", "Emma", "Michael", "Sarah", "David",
    "Lisa", "James", "Emily", "Robert", "Jessica",
]

# Common domains for synthetic data
LEGITIMATE_DOMAINS = [
    "company.com",
    "enterprise.org",
    "business.net",
    "corporation.co",
    "firm.io",
]

PHISHING_DOMAINS = [
    "company-secure.net",
    "enterprise-verify.com",
    "secure-business.org",
    "account-verify.net",
    "security-alert.com",
]

def generate_phishing_email() -> Tuple[str, str, str]:
    """Generate a synthetic phishing email."""
    # Select patterns
    greeting = random.choice(PHISHING_PATTERNS["greetings"])
    hook = random.choice(PHISHING_PATTERNS["hooks"])
    urgency = random.choice(PHISHING_PATTERNS["urgency"])
    threat = random.choice(PHISHING_PATTERNS["threats"])
    cta = random.choice(PHISHING_PATTERNS["calls_to_action"])
    
    # Create email content
    content = f"""{greeting},

{urgency}

{hook}. {threat}.

{cta}

Best regards,
Account Security Team"""
    
    # Create metadata
    sender = f"security@{random.choice(PHISHING_DOMAINS)}"
    subject = f"URGENT: {hook}"
    
    # Create analysis
    analysis = f"""This is a phishing email because:
1. Uses urgent language ("{urgency}")
2. Generic greeting ("{greeting}")
3. Contains threats ("{threat}")
4. Suspicious sender domain ({sender})
5. Pressures user to take immediate action ("{cta}")
6. Lacks personalization and specific details
7. Uses fear tactics to manipulate the recipient"""
    
    return content, subject, analysis

def generate_legitimate_email() -> Tuple[str, str, str]:
    """Generate a synthetic legitimate business email."""
    # Select patterns
    name = random.choice(NAMES)
    greeting = random.choice(LEGITIMATE_PATTERNS["greetings"]).format(name=name)
    topic = random.choice(LEGITIMATE_PATTERNS["business_topics"])
    closing = random.choice(LEGITIMATE_PATTERNS["closings"])
    
    # Create email content
    content = f"""{greeting},

I hope this email finds you well. I wanted to share an update regarding our {topic.lower()}.

We've made significant progress and I'd like to schedule a meeting to discuss the details.
Please let me know what times work best for you this week.

{closing},
{random.choice(NAMES)}"""
    
    # Create metadata
    sender = f"{name.lower()}.{random.choice(['smith', 'jones', 'wilson'])}@{random.choice(LEGITIMATE_DOMAINS)}"
    subject = f"Re: {topic}"
    
    # Create analysis
    analysis = """This is a legitimate email because:
1. Uses personal greeting with recipient's name
2. Natural and professional language
3. Legitimate business domain
4. Clear business context
5. No urgent calls to action
6. No suspicious links or attachments
7. Includes sender's name and proper signature
8. Requests normal business interaction (meeting)"""
    
    return content, subject, analysis

def generate_dataset(
    num_samples: int,
    output_dir: str,
    phishing_ratio: float = 0.5
) -> None:
    """Generate a synthetic dataset of phishing and legitimate emails."""
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Calculate number of each type
    num_phishing = int(num_samples * phishing_ratio)
    num_legitimate = num_samples - num_phishing
    
    dataset = []
    
    # Generate phishing emails
    for _ in range(num_phishing):
        content, subject, analysis = generate_phishing_email()
        dataset.append({
            "content": content,
            "subject": subject,
            "is_phishing": True,
            "analysis": analysis
        })
    
    # Generate legitimate emails
    for _ in range(num_legitimate):
        content, subject, analysis = generate_legitimate_email()
        dataset.append({
            "content": content,
            "subject": subject,
            "is_phishing": False,
            "analysis": analysis
        })
    
    # Shuffle dataset
    random.shuffle(dataset)
    
    # Split into train/val/test
    train_size = int(len(dataset) * 0.8)
    val_size = int(len(dataset) * 0.1)
    
    train_data = dataset[:train_size]
    val_data = dataset[train_size:train_size + val_size]
    test_data = dataset[train_size + val_size:]
    
    # Save datasets
    for split_name, split_data in [
        ("train", train_data),
        ("val", val_data),
        ("test", test_data)
    ]:
        output_file = output_dir / f"{split_name}.jsonl"
        with open(output_file, 'w', encoding='utf-8') as f:
            for example in split_data:
                f.write(json.dumps(example) + '\n')
        
        print(f"Generated {len(split_data)} examples in {output_file}")

if __name__ == "__main__":
    # Generate 1000 examples with 50% phishing ratio
    generate_dataset(
        num_samples=1000,
        output_dir="ml/data/synthetic",
        phishing_ratio=0.5
    ) 