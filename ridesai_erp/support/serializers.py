from rest_framework import serializers


class SupportQuestionSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    question = serializers.CharField()
    answer = serializers.CharField()