"""
Hugging Face LLM Client for Omni Assist.
Provides a clean interface for Hugging Face Inference API.
"""
import os
import logging
from typing import Optional, List, Dict, Any
from django.conf import settings

try:
    from huggingface_hub import InferenceClient
    HF_HUB_AVAILABLE = True
except ImportError as e:
    HF_HUB_AVAILABLE = False
    InferenceClient = None

logger = logging.getLogger(__name__)


class HuggingFaceClient:
    """Client for Hugging Face Inference API."""
    
    def __init__(self):
        # Configuration from settings or environment
        self.api_key = getattr(settings, 'HF_API_KEY', os.environ.get('HF_API_KEY', ''))
        self.model_name = getattr(settings, 'OMNI_ASSIST_MODEL', os.environ.get('OMNI_ASSIST_MODEL', 'openai/gpt-oss-120b'))
        self.max_tokens = int(getattr(settings, 'OMNI_ASSIST_MAX_TOKENS', os.environ.get('OMNI_ASSIST_MAX_TOKENS', '1000')))
        self.enabled = getattr(settings, 'OMNI_ASSIST_ENABLED', True)
        
        self._client = None
        if HF_HUB_AVAILABLE and self.api_key:
            try:
                self._client = InferenceClient(
                    model=self.model_name,
                    token=self.api_key
                )
            except Exception as e:
                logger.error(f"Failed to initialize Hugging Face client: {e}")

    @property
    def is_available(self) -> bool:
        """Check if Hugging Face is properly configured and available."""
        return (
            HF_HUB_AVAILABLE and 
            bool(self.api_key) and 
            self._client is not None and 
            self.enabled
        )
    
    def generate_response(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        temperature: float = 0.7,
    ) -> Dict[str, Any]:
        """
        Generate a response from Hugging Face Inference API.
        """
        if not self.is_available:
            return {
                'content': "I'm currently unavailable. Please check the API configuration.",
                'tokens_used': 0,
                'success': False,
                'error': 'Hugging Face not available - check API key and configuration'
            }
        
        try:
            messages = []
            
            # Add system instruction
            if system_instruction:
                messages.append({
                    'role': 'system',
                    'content': system_instruction
                })
            
            # Add conversation history
            if conversation_history:
                for msg in conversation_history:
                    role = msg.get('role', 'user')
                    # Normalize role names
                    if role == 'model':
                        role = 'assistant'
                    messages.append({
                        'role': role,
                        'content': msg.get('content', '')
                    })
            
            # Add current user prompt
            messages.append({
                'role': 'user',
                'content': prompt
            })
            
            # Generate response using chat_completion
            response = self._client.chat_completion(
                messages=messages,
                max_tokens=self.max_tokens,
                temperature=temperature,
            )
            
            # Parse response
            if hasattr(response, 'choices') and len(response.choices) > 0:
                content = response.choices[0].message.content or ""
                
                # Get token usage
                tokens_used = 0
                if hasattr(response, 'usage') and response.usage:
                    tokens_used = getattr(response.usage, 'total_tokens', 0)
                
                return {
                    'content': content,
                    'tokens_used': tokens_used,
                    'success': True,
                }
            else:
                logger.error(f"Unexpected response format: {response}")
                return {
                    'content': "I encountered an error. Please try again.",
                    'tokens_used': 0,
                    'success': False,
                    'error': f"Unexpected response: {type(response)}"
                }
            
        except Exception as e:
            logger.error(f"Hugging Face API error: {str(e)}")
            return {
                'content': "I encountered an error processing your request. Please try again.",
                'tokens_used': 0,
                'success': False,
                'error': str(e)
            }
    
    def generate_simple(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """Simple generation that returns just the text content."""
        result = self.generate_response(prompt, system_instruction)
        return result.get('content', '')


# Singleton instance
_client_instance = None


def get_llm_client() -> HuggingFaceClient:
    """Get or create the LLM client singleton."""
    global _client_instance
    if _client_instance is None:
        _client_instance = HuggingFaceClient()
    return _client_instance

# Backward compatibility aliases
get_gemini_client = get_llm_client
get_hf_client = get_llm_client
