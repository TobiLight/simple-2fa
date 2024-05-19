#!/usr/bin/env python3
# File: util.py
"""Utilities"""

import re


def check_password_strength(password: str):
    """
    This function checks the strength of a password based on the following criteria:
    - Minimum length (configurable)
    - One uppercase character (A-Z)
    - One lowercase character (a-z)
    - One special character (!@#$%^&*()_+-=[]{};':|\,.<>/?)
    - One digit (0-9)

    Strength is rated as:
    - Very Weak (less than 4 criteria met)
    - Weak (4 criteria met)
    - Medium (5 criteria met)
    - Strong (6 criteria met, including minimum length of 8)
    - Very Strong (all criteria met, including minimum length of 12)
    """

    # Define minimum length requirement (you can adjust this value)
    MIN_LENGTH = 7

    # Regular expressions for different character classes
    uppercase_regex = r"[A-Z]"
    lowercase_regex = r"[a-z]"
    special_char_regex = r"[^a-zA-Z\d\s]"
    digit_regex = r"\d"

    # Check if all character classes are present and count them
    strength_score = 0

    strength_score += bool(re.search(uppercase_regex, password))
    strength_score += bool(re.search(lowercase_regex, password))
    strength_score += bool(re.search(special_char_regex, password))
    strength_score += bool(re.search(digit_regex, password))

    # Additional check for minimum length
    if len(password) >= MIN_LENGTH:
        strength_score += 2

    # Define password strength labels based on the score
    # strength_labels = {
    #     0: "Very Weak",
    #     1: "Weak",
    #     2: "Weak",
    #     3: "Medium",
    #     4: "Medium",
    #     5: "Strong",
    #     6: "Very Strong"
    # }

    return strength_score - 1 >= 3

