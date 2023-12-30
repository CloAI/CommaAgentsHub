from typing import Optional
import os
from bardapi import Bard
from comma_agents.agents import BaseAgent

class BardAgent(BaseAgent):
    """
    BardAgent is an agent that leverages the Bard API for language understanding and generation.

    This agent is a specialized type of `BaseAgent` that uses the Bard API to process natural language inputs.
    It requires a Bard session key to authenticate with the Bard API.

    Parameters
    ----------
    name : str
        The name of the agent.
    bard_session_key : Optional[str], optional
        The session key for Bard API. If not provided, it defaults to the `_BARD_API_KEY` environment variable.
    **kwargs : dict
        Additional keyword arguments passed to the BaseAgent constructor.

    Attributes
    ----------
    bard_session_key : str
        The session key used for Bard API authentication.
    bard : Bard
        An instance of the Bard class from bardapi module, initialized with the bard_session_key.

    Methods
    -------
    _call_llm(message: str) -> str
        Sends a message to the Bard API and returns the response content.
    """

    def __init__(self, name, bard_session_key: Optional[str] = None, **kwargs):
        """
        Initializes the BardAgent with a name, an optional Bard session key, and additional keyword arguments.

        Parameters
        ----------
        name : str
            The name of the agent.
        bard_session_key : Optional[str], optional
            The session key for Bard API. If not provided, defaults to `_BARD_API_KEY` from the environment.
        **kwargs : dict
            Additional keyword arguments passed to the BaseAgent constructor.
        """
        super().__init__(name, **kwargs)
        self.bard_session_key = bard_session_key if bard_session_key is not None else os.environ["_BARD_API_KEY"]
        self.bard = Bard(token=self.bard_session_key)

    def _call_llm(self, message):
        """
        Sends a message to the Bard API and returns the response content.

        This method is intended for internal use to abstract the interaction with the Bard API.

        Parameters
        ----------
        message : str
            The natural language message to be sent to the Bard API.

        Returns
        -------
        str
            The content of the response from the Bard API.
        """
        return self.bard.get_answer(message)['content']
