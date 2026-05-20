class BaseAppException(Exception):
    """Base exception for application errors."""
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)

class ValidationError(BaseAppException):
    pass

class TimeoutError(BaseAppException):
    pass

class ProviderError(BaseAppException):
    pass

class GraphExecutionError(BaseAppException):
    pass

class PersistenceError(BaseAppException):
    pass
