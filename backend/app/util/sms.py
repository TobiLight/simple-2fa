from vonage import vonage

client = vonage.Client(key="dea5c9a0", secret="pqSgDew309fwGJDf")
sms = vonage.Sms(client)


class SMS:
    def __init__(self) -> None:
        pass